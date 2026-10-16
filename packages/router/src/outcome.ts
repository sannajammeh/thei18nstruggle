import { RequestCookies } from "@edge-runtime/cookies";
import { LOCALE_COOKIE, REDIRECT_STATUS } from "./cookies.ts";
import { isCrawler } from "./crawler.ts";
import { resolveLocales } from "./groups.ts";
import { joinLocale, localeLanguage, normalizeLocale } from "./locale.ts";
import { localePath, matchLocalePath } from "./path.ts";
import type {
  GeoHint,
  Routing,
  Locale,
  Outcome,
  RouterRequest,
} from "./types.ts";

export interface OutcomeInput {
  /** Result of `geolocate()`. Null/undefined means geolocation was skipped. */
  geo?: GeoHint | null;
  /** The accepted locale from `negotiate()`. The language subtag is authoritative (browser-decided). */
  locale: Locale;
}

export type ResolveOutcome = (
  request: RouterRequest,
  input: OutcomeInput,
  config: Routing,
) => Promise<Outcome>;

/**
 * Decide what to do with a request, per the blueprint's request handling rules:
 *
 * 1. Crawlers are never redirected.
 * 2. Non-navigation requests are never redirected.
 * 3. Explicit locale URLs (/en-SE/...) are served as requested.
 * 4. Geolocation is the arbiter of truth for the region — with
 *    `geolocation: "force"` the final locale is always `<lang>-<geoRegion>`,
 *    cookie or not; with `"initial"` an existing locale cookie wins instead.
 * 5. Without geolocation, a stored locale cookie wins, then negotiation.
 *
 * Redirects use 307 and carry the original path and query. Commercial-only
 * and canonical handling afterwards is a rendering concern (SEO utilities).
 */
export async function getOutcome(
  request: RouterRequest,
  input: OutcomeInput,
  config: Routing,
): Promise<Outcome> {
  const locales = resolveLocales(config);
  const url = new URL(request.url);
  const cookies = new RequestCookies(request.headers);
  const current = matchLocalePath(url.pathname, locales);
  const serving = current?.locale ?? config.defaultLocale;

  const serve = (): Outcome => ({
    type: "none",
    setCookie: false,
    locale: serving,
    url: url.toString(),
  });

  // 1. Never redirect search engine crawlers.
  if (isCrawler(request.headers.get("user-agent"))) return serve();

  // 2. Never redirect non-navigation requests.
  if (!/^(?:GET|HEAD)$/i.test(request.method ?? "GET")) return serve();

  // 3. Explicit locale URLs are served as requested, cookie or not.
  if (current) return serve();

  const value = cookies.get(LOCALE_COOKIE)?.value;
  const normalized = value ? normalizeLocale(value) : undefined;
  const preferred =
    normalized && locales.includes(normalized) ? normalized : undefined;

  // 4. Geolocation decides the region — "force" overrides everything,
  //    "initial" defers to an existing preference.
  if (
    input.geo &&
    ((config.geolocation ?? "force") === "force" || !preferred)
  ) {
    const target = resolveTarget(locales, input.locale, input.geo);
    return routeTo(url, target, config, preferred !== target);
  }

  // 5. No geolocation: a stored preference wins over negotiation.
  if (preferred) {
    if (
      preferred === config.defaultLocale &&
      (config.localePrefix ?? "as-needed") === "as-needed"
    )
      return serve();
    return redirectTo(
      url,
      localePath(config, preferred, url.pathname),
      preferred,
      false,
    );
  }

  // 6. Negotiation alone decides; nothing is pinned to a cookie.
  return routeTo(url, input.locale, config, false);
}

/**
 * Combine the negotiated locale (browser language) with the geo region:
 * "en-NO" + region "SE" → "en-SE". Falls back to the negotiated locale when
 * the geo region has no matching locale for that language.
 */
export function resolveTarget(
  locales: readonly Locale[],
  locale: Locale,
  geo?: GeoHint | null,
): Locale {
  const candidate = geo?.region
    ? joinLocale(localeLanguage(locale), geo.region)
    : undefined;
  return candidate && locales.includes(candidate) ? candidate : locale;
}

/** Route to a target locale: 307 redirect, internal rewrite, or stay put. */
function routeTo(
  url: URL,
  target: Locale,
  config: Routing,
  setCookie: boolean,
): Outcome {
  const atDefault = target === config.defaultLocale;

  if (atDefault && (config.localePrefix ?? "as-needed") === "as-needed") {
    // Already on the right experience at the root.
    return { type: "none", setCookie, locale: target, url: url.toString() };
  }

  if (atDefault) {
    return {
      type: "rewrite",
      setCookie,
      locale: target,
      url: new URL(
        localePath(config, target, url.pathname) + url.search,
        url,
      ).toString(),
    };
  }

  return redirectTo(
    url,
    localePath(config, target, url.pathname),
    target,
    setCookie,
  );
}

function redirectTo(
  url: URL,
  path: string,
  locale: Locale,
  setCookie: boolean,
): Outcome {
  const outcome: Outcome = {
    type: "redirect",
    setCookie,
    locale,
    url: new URL(path + url.search, url).toString(),
    status: REDIRECT_STATUS,
  };
  // Loop safety: never "redirect" to the URL we are already on.
  if (outcome.url === url.toString()) {
    return { type: "none", setCookie: false, locale, url: url.toString() };
  }
  return outcome;
}
