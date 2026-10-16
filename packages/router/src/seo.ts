import { resolveGroups, resolveLocales } from "./groups.ts";
import { normalizeLocale } from "./locale.ts";
import { localePath } from "./path.ts";
import type { Locale, Routing } from "./types.ts";

/**
 * Locales search engines may index: group canonicals plus locales covered by
 * no group (unique markets).
 */
export function indexableLocales(config: Routing): Locale[] {
  const locales = resolveLocales(config);
  const groups = resolveGroups(config);
  const canonical = new Set(groups.map((group) => group.canonicalLocale));
  const grouped = new Set(groups.flatMap((group) => group.members));
  return [
    ...canonical,
    ...locales.filter(
      (locale) => !canonical.has(locale) && !grouped.has(locale),
    ),
  ];
}

export function isIndexable(config: Routing, locale: string): boolean {
  const normalized = normalizeLocale(locale);
  return (
    normalized !== undefined && indexableLocales(config).includes(normalized)
  );
}

export interface HreflangAlternate {
  hreflang: string;
  href: string;
}

/** The hreflang cluster for an origin: every indexable locale plus x-default at the root. */
export function hreflangAlternates(
  config: Routing,
  origin: string,
): HreflangAlternate[] {
  const base = new URL(origin);
  return [
    { hreflang: "x-default", href: new URL("/", base).toString() },
    ...indexableLocales(config).map((locale) => ({
      hreflang: locale,
      href: new URL(localePath(config, locale), base).toString(),
    })),
  ];
}

export function localeUrl(
  config: Routing,
  locale: string,
  origin: string,
): string {
  return new URL(localePath(config, locale), origin).toString();
}
