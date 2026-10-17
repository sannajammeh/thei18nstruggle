# International Blueprint

## Instructions for Implementing Locale Grouping and Indexing

This document describes how to structure a multilingual e-commerce platform so that search engines see a clean, non-duplicated set of pages while real users still receive the correct country-specific commercial experience (pricing, currency, shipping, availability).

---

## 1. Core Rules

1. **Every locale must include both a language and a country.**  
   Valid examples: `en-US`, `en-GB`, `sv-SE`, `fr-FR`, `de-CH`.  
   Language-only paths (such as `/sv` or `/en`) are not allowed.

2. **The root URL is the canonical English version.**  
   `example.com` represents the default locale (normally `en-US`) and is the only English URL that search engines should index for the collapsed English markets.

3. **Group content-identical markets.**  
   If several English locales (for example `en-SE`, `en-NO`, `en-GB`, `en-US`) contain the same products and the same textual content, they belong to one group. Only the group’s canonical version is indexed.

4. **Keep unique markets fully indexed.**  
   If a market has meaningfully different products, exclusive items, or substantially different content (for example `en-AU` with a different local catalog, or `fr-CA` with distinct North-American copy), it remains a first-class indexed locale with its own hreflang entry.  
   For these unique markets, set the HTML `lang` attribute to the full locale (e.g. `lang="en-AU"`) rather than the bare language (`lang="en"`). This matches BCP 47 and is consistent with how Google uses regional tags on market-specific pages.

5. **Never redirect search engine crawlers.**  
   Bots must always receive the default content at the root (or the appropriate indexed locale). Only human visitors are redirected into their market's locale.

6. **Consolidated locales must not be indexed.**  
   URLs such as `/en-SE` and `/en-NO` exist only so the platform can apply the correct prices and shipping. They must be marked noindex and must point their canonical tag back to the indexed version of their group.

---

## 2. How Grouping Works

Define groups by language (or by language family when content is shared). The examples below describe one consistent reference store, used throughout this document: a brand with a single English catalog, a Nordic language strategy, French for France/Belgium/Canada, and German for the DACH region.

- **English group**  
  Canonical: `en-US` (served at the root `example.com`).  
  Members: `en-US`, `en-GB`, `en-IE`, `en-SE`, `en-NO`, `en-DK`, `en-CA` — the same English words everywhere, different currency and shipping per market (USD, GBP, EUR, SEK, NOK, DKK, CAD).  
  Exclusion: `en-AU` — Australia carries a different product range, so it stays a unique, fully indexed locale.

- **Swedish group**  
  Canonical: `sv-SE`.  
  Members: `sv-SE`, `sv-NO`, `sv-FI` — Nordic shoppers read Swedish; Norway and Finland differ only in currency and shipping.

- **French group**  
  Canonical: `fr-FR`.  
  Members: `fr-FR`, `fr-BE` (identical content, EUR).  
  Exclusion: `fr-CA` — distinct North-American copy for a distinct market, so it stays unique.

- **German group**  
  Canonical: `de-DE`.  
  Members: `de-DE`, `de-AT`, `de-CH` — identical content; EUR in Germany and Austria, CHF in Switzerland.

Canada appears in two groups by design: `en-CA` collapses into the English group while `fr-CA` stays unique — one country, one indexed document per genuinely distinct content.

Unique locales (those listed in the exclusion list) are never collapsed. They receive their own indexed URLs and appear in the hreflang cluster.

---

## 3. TypeScript Schema Examples

The following TypeScript types and an example configuration illustrate the structure described above.

```ts
/** A locale is always language-country, e.g. "en-US", "sv-SE", "fr-FR" */
type Locale = `${string}-${string}`;

/** A language code without country, e.g. "en", "sv" */
type Language = string;

/** A wildcard locale matches every configured region for a language, e.g. "en-*" */
type WildcardLocale = `${string}-*`;

interface LocaleGroup {
  /** The language this group belongs to. */
  language: Language;

  /** The single locale that is indexed and used as the canonical for the group */
  canonicalLocale: Locale;

  /** All locales that share identical content and belong to this group */
  members: (Locale | WildcardLocale)[];

  /** Locales that would otherwise match the language but must stay unique / fully indexed */
  exclude?: (Locale | WildcardLocale)[];
}

interface I18nConfig {
  /** The locale served at the root URL (example.com). Must be a member of the default language group. */
  defaultLocale: Locale;

  /** Complete list of locales the platform can operate in */
  locales: Locale[];

  /** Groups of content-identical locales. */
  groups: LocaleGroup[];
}
```

### Example configuration

```ts
const i18nConfig: I18nConfig = {
  defaultLocale: "en-US",

  locales: [
    // One English catalog, many markets
    "en-US",
    "en-GB",
    "en-IE",
    "en-SE",
    "en-NO",
    "en-DK",
    "en-CA",
    "en-AU", // unique: different catalog

    // Swedish across the Nordics
    "sv-SE",
    "sv-NO",
    "sv-FI",

    // French
    "fr-FR",
    "fr-BE",
    "fr-CA", // unique: North-American copy

    // German for the DACH region
    "de-DE",
    "de-AT",
    "de-CH",
  ],

  groups: [
    {
      language: "en",
      canonicalLocale: "en-US",
      members: ["en-US", "en-GB", "en-IE", "en-SE", "en-NO", "en-DK", "en-CA"],
      exclude: ["en-AU"],
    },
    {
      language: "sv",
      canonicalLocale: "sv-SE",
      members: ["sv-SE", "sv-NO", "sv-FI"],
    },
    {
      language: "fr",
      canonicalLocale: "fr-FR",
      members: ["fr-FR", "fr-BE"],
      exclude: ["fr-CA"],
    },
    {
      language: "de",
      canonicalLocale: "de-DE",
      members: ["de-DE", "de-AT", "de-CH"],
    },
  ],
};
```

Every member must also appear in `locales`; every `locales` entry should either be
a group member or deliberately unique. This configuration tells the system:

- Serve English content for the collapsed markets at the root.
- Index `/sv-SE`, `/fr-FR`, and `/de-DE` as the language canonicals.
- Keep `/en-AU` and `/fr-CA` (excluded from their groups) as independent indexed locales.
- Treat `/en-GB`, `/en-SE`, `/de-CH`, etc. as consolidated (noindex + canonical to their group canonical).

### Flexible model (optional): any language applicable to any country

This is not a core rule. Many multilingual e-commerce stores, however, allow every language to be used with every country. In those cases the full set of locales can be generated automatically:

```ts
const countries = ["US", "GB", "IE", "SE", "NO", "DK", "AU", "FI", "FR", "BE", "CA", "DE", "AT", "CH"];
const languages = ["en", "sv", "fr", "de"];

const locales = countries.flatMap((c) =>
  languages.map((l) => `${l}-${c}` as Locale),
);
// Result: ["en-US", "sv-US", "fr-US", "de-US", "en-GB", "sv-GB", ...]
```

Groups can then use wildcards so you do not have to list every member explicitly:

```ts
const i18nConfig: I18nConfig = {
  defaultLocale: "en-US",
  locales,

  groups: [
    {
      language: "en",
      canonicalLocale: "en-US",
      members: ["en-*"], // every configured English locale
      exclude: ["en-AU"], // Australia remains unique
    },
    { language: "sv", canonicalLocale: "sv-SE", members: ["sv-*"] },
    {
      language: "fr",
      canonicalLocale: "fr-FR",
      members: ["fr-*"],
      exclude: ["fr-CA"], // Canada remains unique
    },
    { language: "de", canonicalLocale: "de-DE", members: ["de-*"] },
  ],
};
```

### Deriving the indexable locales

Unique / indexable locales are derived automatically:

- Each group’s `canonicalLocale`.
- Every locale listed in any group’s `exclude` array.
- Every locale that is not covered by any group’s `members` (after expanding wildcards).

```ts
const indexableLocales = getIndexableLocales(i18nConfig);

// Example result for the configuration above:
// [
//   "en-US",   // root / English canonical
//   "sv-SE",   // Swedish canonical
//   "fr-FR",   // French canonical
//   "de-DE",   // German canonical
//   "en-AU",   // excluded from the English group → unique
//   "fr-CA",   // excluded from the French group → unique
// ]
```

Everything else (`en-GB`, `en-SE`, `en-CA`, `sv-NO`, `fr-BE`, `de-CH`, etc.) is treated as consolidated: available to users, but not indexed and canonicalized back to the appropriate group canonical.

---

## 4. What Search Engines See

Search engines are only shown the indexed versions:

- `example.com` (English canonical for the whole English group)
- `example.com/sv-SE` (primary Swedish)
- `example.com/fr-FR` (primary French)
- `example.com/de-DE` (primary German)
- `example.com/en-AU` (unique English-Australia)
- `example.com/fr-CA` (unique French-Canada)

Hreflang annotations are emitted only for these indexed URLs — seventeen configured locales collapse to six documents plus `x-default`.  
Each indexed page lists itself, points `x-default` to the root, and links bidirectionally to the other indexed variants.  
Consolidated locales (`/en-GB`, `/en-SE`, `/en-CA`, `/de-CH`, etc.) do not appear in any hreflang list.

---

## 5. What Real Users Experience

1. A visitor lands on `example.com` (or any indexed URL).
2. The platform detects the visitor’s country (via edge geolocation).
3. If the visitor has no previously chosen locale, they are redirected (307) into the locale that matches their country (for example Sweden → `/en-SE`).
4. A cookie is set so subsequent requests stay in that locale.
5. The consolidated locale page applies the correct currency, prices, shipping rules, and availability, but it is not indexed and its canonical points back to the indexed version of its group.

If the user manually switches language or country, that preference is stored and respected over automatic geo-routing.

**Geolocation bypass.**  
If a user explicitly wants to stay in a different market and not be redirected (for example, someone on vacation in the USA who still wants to order to their Norwegian address), a cookie named `X-BYPASS-GEOLOCATION` can be set. When this cookie is present, geo-based redirects are skipped. The cookie should have a 7-day lifetime.

This cookie must **not** be `httpOnly`. It needs to be readable by client-side JavaScript so the front end can detect the bypass state and offer a way to clear it (for example, a “switch market” or “resume geo-routing” control).

---

## 6. Indexing and Canonical Policy

| URL pattern              | Indexed? | Canonical points to  | Purpose                                           |
| ------------------------ | -------- | -------------------- | ------------------------------------------------- |
| `example.com`            | Yes      | itself               | English content for all collapsed English markets |
| `/sv-SE`                 | Yes      | itself               | Primary Swedish version                           |
| `/fr-FR`                 | Yes      | itself               | Primary French version                            |
| `/de-DE`                 | Yes      | itself               | Primary German version                            |
| `/en-AU` (unique)        | Yes      | itself               | Distinct Australian catalog                       |
| `/fr-CA` (unique)        | Yes      | itself               | Distinct Canadian French market                   |
| `/en-GB`, `/en-IE`, `/en-SE`, `/en-NO`, `/en-DK`, `/en-CA` | No | root (`example.com`) | Market localization only |
| `/sv-NO`, `/sv-FI`       | No       | `/sv-SE`             | Market localization only                          |
| `/fr-BE`                 | No       | `/fr-FR`             | Market localization only                          |
| `/de-AT`, `/de-CH`       | No       | `/de-DE`             | Market localization only                          |

---

## 7. Request Handling Rules

- **Crawlers**  
  Always serve the default (indexed) content. Do not perform geo-redirects.

- **Human visitors without a locale cookie**  
  Detect country → resolve the matching locale → 307 redirect → set cookie.

- **Human visitors with a locale cookie**  
  Honor the cookie and serve the corresponding commercial experience.

- **Consolidated locale pages**  
  Must contain a noindex directive and a canonical tag pointing to the indexed version of their group.

- **Sitemaps**  
  Include only indexed URLs.

---

## 8. Expected Result

Search results for users in Sweden (or any collapsed market) show a single clean English root URL plus any true language variants (`sv-SE`, `fr-FR`, etc.). After the user clicks, they are transparently placed into the correct commercial context with Swedish prices and shipping. Markets that are genuinely different remain independently indexable and appear in hreflang. This produces the same clarity of search results observed with well-optimized international brands while still satisfying multi-country commercial requirements.

---

## 9. Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Middleware
    participant EdgeGeo as Edge Geolocation
    participant App as Application

    User->>Browser: Visit example.com
    Browser->>Middleware: Request (cookies)

    alt X-BYPASS-GEOLOCATION cookie present
        Middleware->>App: Serve requested locale (no geo redirect)
        App-->>Browser: Response (commercial rules for chosen locale)
    else Preference cookie present
        Middleware->>App: Serve preferred locale
        App-->>Browser: Response
    else No preference / no bypass
        Middleware->>EdgeGeo: Detect country
        EdgeGeo-->>Middleware: Country code (e.g. SE)
        Middleware->>Browser: 307 redirect to /en-SE + set ROUTER_LOCALE cookie
        Browser->>Middleware: Follow redirect to /en-SE
        Middleware->>App: Serve /en-SE
        App-->>Browser: Response (Swedish prices & shipping)<br/>noindex + canonical to example.com
    end

    Browser-->>User: Render page

    Note over Browser,App: X-BYPASS-GEOLOCATION is not httpOnly<br/>so client JS can read and clear it
```
