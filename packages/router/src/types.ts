/**
 * Core types for @concept/router.
 *
 * All locales are BCP 47 language-country tags (e.g. "en-US", "sv-SE", "fr-FR").
 * Language-only locales (such as "/sv" or "/en") are not supported, per the
 * international blueprint.
 */

/** A locale is always language-country, e.g. "en-US", "sv-SE", "fr-FR". */
export type Locale = `${string}-${string}`;

/** A language subtag without country, e.g. "en", "sv", "fr". */
export type Language = string;

/** A region/country subtag, e.g. "US", "SE", "NO". */
export type Region = string;

/** A wildcard locale matches every region for a language, e.g. "en-*". */
export type WildcardLocale = `${string}-*`;

export type LocalePrefix = "as-needed" | "always";

export type GeolocationMode = "force" | "initial";

export interface LocaleGroup {
  /** The language subtag this group collapses, e.g. "en". */
  language: Language;
  /** The single locale that is indexed and used as the canonical for the group. */
  canonicalLocale: Locale;
  /** All locales that share identical content and belong to this group. Wildcards ("en-*") are allowed. */
  members: (Locale | WildcardLocale)[];
  /** Locales that would otherwise match the language but must stay unique / fully indexed. Wildcards are allowed. */
  exclude?: (Locale | WildcardLocale)[];
}

export interface Routing {
  /**
   * The locale served at the root URL (example.com).
   * Must be a member of the default language group.
   */
  defaultLocale: Locale;

  /** Complete list of locales the platform can operate in. */
  locales: Locale[];

  /**
   * Groups of content-identical locales, keyed by their `language` subtag.
   */
  groups: LocaleGroup[];

  /**
   * Whether the default locale is served without a URL prefix.
   *
   * - "as-needed" (default): the default locale lives at the root (`example.com`),
   *   every other locale is prefixed (`example.com/sv-SE`).
   * - "always": every locale gets a prefix; unprefixed paths are rewritten to the
   *   prefixed default internally.
   */
  localePrefix?: LocalePrefix;

  /**
   * How geolocation interacts with a stored locale preference:
   *
   * - "force" (default): the geo region is the arbiter of truth — the final
   *   locale's region is always `<lang>-<geoRegion>`, cookie or not.
   * - "initial": geo decides only until a locale cookie exists; afterwards the
   *   preference wins.
   */
  geolocation?: GeolocationMode;
}

/**
 * A geolocation hint resolved for the current request. The region is the
 * arbiter of truth for the locale's region subtag; the language is always
 * decided by the browser (via `negotiate`).
 */
export interface GeoHint {
  region: Region;
}

/** Minimal request surface the core stages need. Satisfied by NextRequest, Astro requests, etc. */
export interface RouterRequest {
  url: string | URL;
  headers: Headers;
  /** HTTP method. Defaults to "GET". Non-GET/HEAD requests are never redirected. */
  method?: string;
}

/** What the proxy decided to do with a request. Framework-agnostic. */
export interface Outcome {
  type: "redirect" | "rewrite" | "none";
  /** Whether the adapter should persist the resolved locale as a preference cookie. */
  setCookie: boolean;
  /** The locale the request ends up being served in. */
  locale: Locale;
  /** Absolute URL for redirect/rewrite targets; the untouched request URL for "none". */
  url: string;
  /** HTTP status for redirects. Always 307 (temporary) so browsers keep using the root. */
  status?: 307;
}
