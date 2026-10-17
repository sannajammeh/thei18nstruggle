import { RequestCookies } from "@edge-runtime/cookies";
import { resolveCookies } from "./cookies.ts";
import { isCrawler } from "./crawler.ts";
import { resolveLocales } from "./groups.ts";
import { joinLocale, normalizeLocale, parseLocale } from "./locale.ts";
import { localePath, matchLocalePath } from "./path.ts";
import type {
  GeoHint,
  Locale,
  MaybePromise,
  Outcome,
  Routing,
} from "./types.ts";

export interface OutcomeInput {
  /** Result of `geolocate()`. Null/undefined means geolocation was skipped. */
  geo?: GeoHint | null;
  /** The accepted locale from `negotiate()`. The language subtag is authoritative (browser-decided). */
  locale: Locale;
}

export type ResolveOutcome = (
  request: Request,
  input: OutcomeInput,
  config: Routing,
) => MaybePromise<Outcome>;

export async function getOutcome(
  request: Request,
  input: OutcomeInput,
  config: Routing,
): Promise<Outcome> {
  const locales = resolveLocales(config);
  const { locale: localeCookie } = resolveCookies(config);
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

  if (isCrawler(request.headers.get("user-agent"))) {
    return current ? serve() : rewriteToDefault(url, config);
  }

  if (!/^(?:GET|HEAD)$/i.test(request.method)) {
    return current ? serve() : rewriteToDefault(url, config);
  }

  if (current) return serve();

  const value = cookies.get(localeCookie)?.value;
  const normalized = value ? normalizeLocale(value) : undefined;
  const preferred =
    normalized && locales.includes(normalized) ? normalized : undefined;

  // "force" overrides any preference; "initial" defers to an existing one.
  if (
    input.geo &&
    ((config.geolocation ?? "force") === "force" || !preferred)
  ) {
    const target = resolveTarget(locales, input.locale, input.geo);
    return routeTo(url, target, config, preferred !== target);
  }

  if (preferred) {
    if (preferred === config.defaultLocale) {
      return rewriteToDefault(url, config);
    }
    return redirectTo(
      url,
      localePath(url.pathname, preferred, config),
      preferred,
      config,
      false,
    );
  }

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
    ? joinLocale(parseLocale(locale)?.language, geo.region)
    : undefined;
  return candidate && locales.includes(candidate) ? candidate : locale;
}

/**
 * Unprefixed requests are rewritten into the default locale's prefixed
 * subtree — force-prefixed regardless of `localePrefix`, since the request
 * URL carries no prefix.
 */
function rewriteToDefault(url: URL, config: Routing): Outcome {
  const rest = url.pathname === "/" ? "" : url.pathname;
  return {
    type: "rewrite",
    setCookie: false,
    locale: config.defaultLocale,
    url: new URL(
      `/${config.defaultLocale}${rest}${url.search}`,
      url,
    ).toString(),
  };
}

function routeTo(
  url: URL,
  target: Locale,
  config: Routing,
  setCookie: boolean,
): Outcome {
  if (target === config.defaultLocale) {
    return { ...rewriteToDefault(url, config), setCookie };
  }

  return redirectTo(
    url,
    localePath(url.pathname, target, config),
    target,
    config,
    setCookie,
  );
}

function redirectTo(
  url: URL,
  path: string,
  locale: Locale,
  config: Routing,
  setCookie: boolean,
): Outcome {
  const outcome: Outcome = {
    type: "redirect",
    setCookie,
    locale,
    url: new URL(path + url.search, url).toString(),
    status: resolveCookies(config).redirectStatus,
  };
  // Loop safety: never "redirect" to the URL we are already on.
  if (outcome.url === url.toString()) {
    return { type: "none", setCookie: false, locale, url: url.toString() };
  }
  return outcome;
}
