import type { CookieConfig, Routing } from "./types.ts";

/** Defaults for `Routing.cookies`; every field is overridable in the config. */
export const cookieDefaults: CookieConfig = {
  locale: "ROUTER_LOCALE",
  bypass: "X-BYPASS-GEOLOCATION",
  localeMaxAge: 60 * 60 * 24 * 365,
  bypassMaxAge: 60 * 60 * 24 * 7,
  redirectStatus: 307,
};

export function resolveCookies(config: Routing): CookieConfig {
  return { ...cookieDefaults, ...config.cookies };
}
