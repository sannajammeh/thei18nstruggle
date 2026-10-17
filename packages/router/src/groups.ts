import { normalizeLocale, parseLocale } from "./locale.ts";
import type { Language, Locale, Routing, WildcardLocale } from "./types.ts";

/** A group with wildcards expanded, unknown locales dropped, and excludes applied. */
export interface ResolvedGroup {
  language: Language;
  canonicalLocale: Locale;
  members: Locale[];
}

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

export function languageGroup(
  config: Routing,
  language: string,
): ResolvedGroup | undefined {
  return resolveGroups(config).find(
    (group) => group.language === language.toLowerCase(),
  );
}

export function canonicalLocale(config: Routing, locale: string): Locale {
  const normalized = normalizeLocale(locale);
  if (!normalized) return locale as Locale;
  return localeGroup(config, normalized)?.canonicalLocale ?? normalized;
}

/** A grouped member that is not its group's canonical: noindex, canonical points to the canonical. */
export function isCommercialOnly(config: Routing, locale: string): boolean {
  const normalized = normalizeLocale(locale);
  if (!normalized) return false;
  const group = localeGroup(config, normalized);
  return group !== undefined && group.canonicalLocale !== normalized;
}

function expand(
  entries: (Locale | WildcardLocale)[],
  localeSet: Set<Locale>,
): Locale[] {
  const result: Locale[] = [];
  for (const entry of entries) {
    if (entry.endsWith("-*")) {
      const wildcardLanguage = entry.slice(0, -2).toLowerCase();
      for (const locale of localeSet) {
        if (parseLocale(locale)?.language === wildcardLanguage)
          result.push(locale);
      }
      continue;
    }
    const normalized = normalizeLocale(entry);
    if (normalized && localeSet.has(normalized)) result.push(normalized);
  }
  return result;
}
