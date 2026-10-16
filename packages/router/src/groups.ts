import { localeLanguage, normalizeLocale } from "./locale.ts";
import type { Routing, Language, Locale, WildcardLocale } from "./types.ts";

/** A group with wildcards expanded, unknown locales dropped, and excludes applied. */
export interface ResolvedGroup {
  language: Language;
  canonicalLocale: Locale;
  members: Locale[];
}

/**
 * Normalize and validate the config's locale list. Locales must be
 * language-country BCP 47 tags ("en-US"), never bare languages, and the
 * default locale must be one of them.
 */
export function resolveLocales(config: Routing): Locale[] {
  const locales: Locale[] = [];
  for (const raw of config.locales) {
    const locale = normalizeLocale(raw);
    if (!locale) {
      throw new Error(
        `[i18n] "${raw}" is not a valid locale. Locales must be language-country BCP 47 tags like "en-US" or "sv-SE".`,
      );
    }
    if (!locales.includes(locale)) locales.push(locale);
  }
  if (locales.length === 0) {
    throw new Error("[i18n] config.locales must contain at least one locale.");
  }
  const defaultLocale = normalizeLocale(config.defaultLocale);
  if (!defaultLocale || !locales.includes(defaultLocale)) {
    throw new Error(
      `[i18n] defaultLocale "${config.defaultLocale}" must be one of config.locales.`,
    );
  }
  return locales;
}

/**
 * Resolve the config's groups: `lang-*` wildcards are expanded against the
 * known locales, members referencing locales the platform does not operate in
 * are dropped (not fatal), and excluded locales are removed from membership —
 * exclusion is what makes a locale unique (fully indexed) rather than grouped.
 */
export function resolveGroups(config: Routing): ResolvedGroup[] {
  const localeSet = new Set(resolveLocales(config));
  const groups: ResolvedGroup[] = [];
  for (const [index, group] of (config.groups ?? []).entries()) {
    const canonicalLocale = normalizeLocale(group.canonicalLocale);
    if (!canonicalLocale || !localeSet.has(canonicalLocale)) {
      throw new Error(
        `[i18n] groups[${index}].canonicalLocale "${group.canonicalLocale}" must be one of config.locales.`,
      );
    }
    const exclude = new Set(expand(group.exclude ?? [], localeSet));
    const members = expand(group.members, localeSet).filter(
      (locale) => !exclude.has(locale),
    );
    groups.push({
      language: group.language.toLowerCase(),
      canonicalLocale,
      members: [...new Set(members)],
    });
  }
  return groups;
}

/** The group a locale belongs to as a member; locales outside every group are unique markets. */
export function localeGroup(
  config: Routing,
  locale: string,
): ResolvedGroup | undefined {
  const normalized = normalizeLocale(locale);
  if (!normalized) return undefined;
  return resolveGroups(config).find((group) =>
    group.members.includes(normalized),
  );
}

/** The group defined for a language, regardless of membership. */
export function languageGroup(
  config: Routing,
  language: string,
): ResolvedGroup | undefined {
  return resolveGroups(config).find(
    (group) => group.language === language.toLowerCase(),
  );
}

/** The canonical locale of the locale's group, or the locale itself when unique. */
export function canonicalLocale(config: Routing, locale: string): Locale {
  const normalized = normalizeLocale(locale);
  if (!normalized) return locale as Locale;
  return localeGroup(config, normalized)?.canonicalLocale ?? normalized;
}

/** Grouped member that is not the canonical: noindex, canonical points elsewhere. */
export function isCommercialOnly(config: Routing, locale: string): boolean {
  const normalized = normalizeLocale(locale);
  if (!normalized) return false;
  const group = localeGroup(config, normalized);
  return group !== undefined && group.canonicalLocale !== normalized;
}

/** Expand a member list, expanding `lang-*` wildcards against the known locales. */
function expand(
  entries: (Locale | WildcardLocale)[],
  localeSet: Set<Locale>,
): Locale[] {
  const result: Locale[] = [];
  for (const entry of entries) {
    if (entry.endsWith("-*")) {
      const wildcardLanguage = entry.slice(0, -2).toLowerCase();
      for (const locale of localeSet) {
        if (localeLanguage(locale) === wildcardLanguage) result.push(locale);
      }
      continue;
    }
    // Unknown members (like the blueprint's en-DE/en-NL example) are ignored.
    const normalized = normalizeLocale(entry);
    if (normalized && localeSet.has(normalized)) result.push(normalized);
  }
  return result;
}
