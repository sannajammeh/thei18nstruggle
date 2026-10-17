# @concept/router

Locale-grouping router implementing the international blueprint: search engines
see a clean, non-duplicated set of indexed pages; humans are transparently
placed into the right commercial context (prices, currency, shipping).

Framework-agnostic core, with a thin Next.js adapter.

## Architecture

Pure, composable stages over a serializable config — no instances, no factories:

```
Routing (plain, serializable)
        │
 geolocate()  →  negotiate()  →  getOutcome()  →  getResponse()
   (region)       (language)       (§7 rules)       (framework)
```

- `@concept/router` — config types, the stages, group/SEO utilities.
- `@concept/router/next` — `createRouter` (one-liner proxy) and `getResponse`
  (`Outcome` → `NextResponse`).

Every function takes the `Routing` (or a slice of it) and derives what it
needs — wildcards, groups, indexability — on the fly. Cheap by design: the
whole derivation is linear in the number of locales. Validation happens at the
boundary (`resolveLocales`/`resolveGroups` throw on invalid configs), so a bad
config fails loudly the first time it is used.

## Built on

- **`Intl.Locale`** (native) — BCP 47 parsing and normalization.
- **`negotiator`** — Accept-Language header parsing/quality ordering.
- **`@formatjs/intl-localematcher`** — CLDR-style locale matching with proper fallback.
- **`@edge-runtime/cookies`** — the cookie store Next itself uses, so core and adapter share one cookie model.

## Happy path (Next.js `proxy.ts`)

```ts
// proxy.ts
import { createRouter } from "@concept/router/next";
import { routing } from "./i18n";

export const proxy = await createRouter(routing);

export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml).*)",
};
```

The matcher must be an inline constant — Next.js statically analyzes it at
build time, so imported values are ignored. The string above excludes API
routes, static assets, and metadata files.

## Decoupled path (Astro, other frameworks)

The core stages accept any WinterCG-compliant `Request`, so the same config and
stages run in any runtime.

```ts
import { geolocate, getOutcome, negotiate } from "@concept/router";
import { getResponse } from "@concept/router/next";
import { routing } from "./i18n";

const geo = await geolocate(request, routing);
// → { region: "NO" } — or null when geolocation is skipped

const acceptedLocale = await negotiate(request, routing);
// → "en-NO" ?? the default locale

const outcome = await getOutcome(request, { geo, locale: acceptedLocale }, routing);
// → { type: "redirect" | "rewrite" | "none", setCookie: boolean, locale, url }

const response = await getResponse(outcome, routing);
// → framework response (NextResponse in the /next entry, swap your own elsewhere)
```

`geolocate` returns null — meaning "skipped, fall back to cookie/negotiation" —
for crawler user agents, visitors carrying the `X-BYPASS-GEOLOCATION` cookie,
and requests with no geo headers. Passing `geo: null` yourself does the same.

## Decision rules

In order (blueprint §7):

1. **Crawlers are never redirected.** `geolocate` skips them and `getOutcome`
   refuses to redirect them regardless.
2. **Non-GET/HEAD requests are never redirected.**
3. **Explicit locale URLs** (`/en-SE/...`) are served as requested — visitors
   are never bounced off a URL they deliberately navigated to.
4. **Geolocation is the arbiter of truth for the region.** With
   `geolocation: "force"` (default) the final locale is always
   `<browserLanguage>-<geoRegion>`, cookie or not: preference `sv-SE` + geo
   `NO` → `sv-NO`. With `geolocation: "initial"` geo only decides until a
   locale cookie exists.
5. **Without geolocation** (skipped or unavailable): a stored locale cookie
   wins, then Accept-Language negotiation. Negotiated-only targets are not
   pinned into a cookie.
6. **First visit, unprefixed:** accept `en-NO` + geo region `SE` → `en-SE`
   (not `en-NO`). The target is a 307 redirect and the choice is remembered
   in the cookie.
7. **Unprefixed URLs never 404 and never redirect to a prefixed default:**
   requests without a locale prefix are internally rewritten to
   `/{defaultLocale}/...`, so a `[locale]`-only app tree renders them and the
   root URL stays canonical — this includes crawlers, who get the default
   content. `none` ("serve as-is") is reserved for explicit locale URLs.

Redirects carry the original path and query string.

## Config

```ts
const routing: Routing = {
  defaultLocale: "en-US",
  locales: ["en-US", "en-SE", "en-NO", "en-GB", "en-FR", "sv-SE", "sv-NO", "fr-FR"],
  groups: [
    {
      language: "en",
      canonicalLocale: "en-US",
      members: ["en-*"], // wildcard: every configured en-* locale
      exclude: ["en-FR"], // France stays unique / fully indexed
    },
    { language: "sv", canonicalLocale: "sv-SE", members: ["sv-*"] },
    { language: "fr", canonicalLocale: "fr-FR", members: ["fr-*"] },
  ],
  localePrefix: "as-needed", // default; "always" prefixes the default locale too
  geolocation: "force", // default; "initial" defers to an existing locale cookie
  cookies: {
    // all optional, defaults shown:
    locale: "ROUTER_LOCALE",
    bypass: "X-BYPASS-GEOLOCATION",
    localeMaxAge: 60 * 60 * 24 * 365,
    bypassMaxAge: 60 * 60 * 24 * 7,
    redirectStatus: 307,
  },
};
```

Indexable locales are derived: every group canonical + every locale excluded
from its group + every locale covered by no group. Everything else is
consolidated: reachable, noindex, canonicalizing back to its group.

## SEO utilities

Humans can reach every locale combination; bots and metadata only ever see the
indexable set.

```ts
import {
  canonicalLocale,
  hreflangAlternates,
  indexableLocales,
  isConsolidated,
  isIndexable,
} from "@concept/router";

indexableLocales(routing); // ["en-US", "sv-SE", "fr-FR", "en-FR"]
isConsolidated(routing, "en-SE"); // true → noindex, canonical → en-US
canonicalLocale(routing, "en-SE"); // "en-US"
hreflangAlternates(routing, "https://example.com");
// [{ hreflang: "x-default", href: "https://example.com/" },
//  { hreflang: "en-US", href: "https://example.com/" },
//  { hreflang: "sv-SE", href: "https://example.com/sv-SE" }, ...]
```

Unique markets keep their full BCP 47 tag in hreflang (`en-FR`, not `en`).
Sitemaps should be built from `indexableLocales` only.
