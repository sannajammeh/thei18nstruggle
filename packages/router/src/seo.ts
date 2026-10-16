import { resolveGroups, resolveLocales } from "./groups.ts";
import { normalizeLocale } from "./locale.ts";
import { localePath } from "./path.ts";
import type { Routing, Locale } from "./types.ts";

/**
 * SEO utilities for the locale grouping model.
 *
 * The app can render every locale combination for humans (commercial-only
 * locales included), while these helpers keep what bots and metadata see
 * restricted to the indexable set: group canonicals + unique markets.
 */

/**
 * Locales search engines may index: every group canonical, plus every locale
 * covered by no group (unique markets — which includes excluded locales).
 * Order: canonicals in group order first, then uniques in locale order.
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

/** Whether a locale is indexed and canonical to itself. */
export function isIndexable(config: Routing, locale: string): boolean {
  const normalized = normalizeLocale(locale);
  return (
    normalized !== undefined && indexableLocales(config).includes(normalized)
  );
}

export interface HreflangAlternate {
  /** BCP 47 tag, e.g. "en-US". Unique markets keep their full tag (e.g. "en-FR"). */
  hreflang: string;
  href: string;
}

/**
 * The hreflang cluster for an origin: every indexable locale, plus x-default
 * pointing at the root. Commercial-only locales never appear.
 */
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

/** The absolute URL for a locale's entry point. */
export function localeUrl(
  config: Routing,
  locale: string,
  origin: string,
): string {
  return new URL(localePath(config, locale), origin).toString();
}
