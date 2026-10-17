export { cookieDefaults, resolveCookies } from "./cookies.ts";
export { isCrawler } from "./crawler.ts";
export {
  type Geolocate,
  geolocate,
} from "./geolocate.ts";
export {
  canonicalLocale,
  isCommercialOnly,
  languageGroup,
  localeGroup,
  type ResolvedGroup,
  resolveGroups,
  resolveLocales,
} from "./groups.ts";
export {
  joinLocale,
  normalizeLocale,
  parseLocale,
} from "./locale.ts";
export {
  getOutcome,
  type OutcomeInput,
  type ResolveOutcome,
  resolveTarget,
} from "./outcome.ts";
export {
  type LocalePath,
  localePath,
  localizePath,
  matchLocalePath,
  withLocalePrefix,
} from "./path.ts";
export {
  getHtmlLang,
  type HreflangAlternate,
  hreflangAlternates,
  indexableLocales,
  isIndexable,
  localeUrl,
} from "./seo.ts";
export type {
  CookieConfig,
  GeoHint,
  GeolocationMode,
  Language,
  Locale,
  LocaleGroup,
  LocalePrefix,
  MaybePromise,
  Outcome,
  Region,
  Routing,
  WildcardLocale,
} from "./types.ts";
