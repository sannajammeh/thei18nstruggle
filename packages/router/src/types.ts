/** A language subtag without country, e.g. "en", "sv", "fr". */
export type Language = string;

/** A region/country subtag, e.g. "US", "SE", "NO". */
export type Region = string;

/** A locale is always language-country, e.g. "en-US", "sv-SE", "fr-FR". */
export type Locale = `${string}-${string}`;

/** A wildcard locale matches every region for a language, e.g. "en-*". */
export type WildcardLocale = `${string}-*`;

export type LocalePrefix = "as-needed" | "always";

export type GeolocationMode = "force" | "initial";

export interface LocaleGroup {
  language: Language;
  /** The single locale that is indexed and used as the canonical for the group. */
  canonicalLocale: Locale;
  /** All locales that share identical content and belong to this group. */
  members: (Locale | WildcardLocale)[];
  /** Locales that would otherwise match the language but must stay unique / fully indexed. */
  exclude?: (Locale | WildcardLocale)[];
}

export interface Routing {
  /** The locale served at the root URL. */
  defaultLocale: Locale;

  locales: Locale[];

  /** Groups of content-identical locales. */
  groups: LocaleGroup[];

  /**
   * Whether the default locale is served without a URL prefix.
   * "as-needed" (default): the default locale lives at the root, every other
   * locale is prefixed. "always": every locale gets a prefix.
   */
  localePrefix?: LocalePrefix;

  /**
   * How geolocation interacts with a stored locale preference:
   * "force" (default): the final locale's region is always `<lang>-<geoRegion>`,
   * cookie or not. "initial": geo decides only until a locale cookie exists.
   */
  geolocation?: GeolocationMode;
}

/** A geolocation hint resolved for the current request. */
export interface GeoHint {
  region: Region;
}

/** Minimal request surface the core stages need; satisfied by NextRequest and friends. */
export interface RouterRequest {
  url: string | URL;
  headers: Headers;
  method?: string;
}

/**
 * What the proxy decided to do with a request. Framework-agnostic.
 *
 * `type: "none"` means "this request is okay — continue serving it as-is",
 * e.g. an explicit locale URL the visitor deliberately navigated to.
 */
export interface Outcome {
  type: "redirect" | "rewrite" | "none";
  /** Whether the adapter should persist the resolved locale as a preference cookie. */
  setCookie: boolean;
  /** The locale the request ends up being served in. */
  locale: Locale;
  /** Absolute URL for redirect/rewrite targets; the untouched request URL for "none". */
  url: string;
  /** HTTP status for redirects. */
  status?: 307;
}
