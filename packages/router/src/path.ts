import { normalizeLocale } from "./locale.ts";
import type { Locale, LocalePrefix, Routing } from "./types.ts";

export interface LocalePath {
  locale: Locale;
  rest: string;
}

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

export function stripLocalePrefix(
  pathname: string,
  locales: readonly Locale[],
): { pathname: string; locale: Locale | null } {
  const match = matchLocalePath(pathname, locales);
  if (!match) return { pathname, locale: null };
  return { pathname: match.rest || "/", locale: match.locale };
}

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
