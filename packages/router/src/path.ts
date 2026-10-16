import { normalizeLocale } from "./locale.ts";
import type { Routing, Locale, LocalePrefix } from "./types.ts";

export interface LocalePath {
  locale: Locale;
  /** The remainder of the pathname after the locale prefix, starting with "/" (or empty). */
  rest: string;
}

/**
 * Detect a configured locale as the first path segment.
 * "/sv-SE/products" → { locale: "sv-SE", rest: "/products" }, "/" → null.
 */
export function matchLocalePath(
  pathname: string,
  locales: readonly Locale[],
): LocalePath | null {
  const match = /^\/([^/]+)((?:\/.*)?)$/.exec(pathname);
  if (!match) return null;
  const locale = normalizeLocale(match[1]);
  if (!locale || !locales.includes(locale)) return null;
  return { locale, rest: match[2] || "" };
}

/** Prefix a pathname with a locale, honoring the `localePrefix` strategy. */
export function withLocalePrefix(
  pathname: string,
  locale: Locale,
  options: { defaultLocale: Locale; localePrefix: LocalePrefix },
): string {
  const base = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (options.localePrefix === "as-needed" && locale === options.defaultLocale)
    return base;
  return `/${locale}${base === "/" ? "" : base}`;
}

/** Inverse of {@link matchLocalePath}: remove a locale prefix from a pathname. */
export function stripLocalePrefix(
  pathname: string,
  locales: readonly Locale[],
): { pathname: string; locale: Locale | null } {
  const match = matchLocalePath(pathname, locales);
  if (!match) return { pathname, locale: null };
  return { pathname: match.rest || "/", locale: match.locale };
}

/** The URL path for a locale, honoring the config's `localePrefix` strategy. */
export function localePath(
  config: Routing,
  locale: string,
  pathname = "/",
): string {
  const normalized = normalizeLocale(locale) ?? config.defaultLocale;
  return withLocalePrefix(pathname, normalized, {
    defaultLocale: config.defaultLocale,
    localePrefix: config.localePrefix ?? "as-needed",
  });
}
