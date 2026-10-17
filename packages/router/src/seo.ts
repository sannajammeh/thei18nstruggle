import { isCommercialOnly, resolveGroups, resolveLocales } from "./groups.ts";
import { normalizeLocale, parseLocale } from "./locale.ts";
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
      href: new URL(localePath("/", locale, config), base).toString(),
    })),
  ];
}

export function localeUrl(
  config: Routing,
  locale: string,
  origin: string,
): string {
  return new URL(localePath("/", locale, config), origin).toString();
}

/**
 * The HTML lang attribute for a locale: unique markets and canonicals carry
 * the full BCP 47 tag ("en-FR", "en-US"), grouped commercial-only members the
 * bare language ("en").
 */
export function getHtmlLang(locale: string, config: Routing): string {
  const normalized = normalizeLocale(locale);
  if (!normalized) return locale;
  return isCommercialOnly(config, normalized)
    ? (parseLocale(normalized)?.language ?? normalized)
    : normalized;
}
