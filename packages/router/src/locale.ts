import type { Language, Locale, Region } from "./types.ts";

/**
 * Normalize a locale tag via the native BCP 47 parser (`Intl.Locale`).
 * Returns undefined for invalid tags and for language-only tags — the
 * blueprint requires language-country ("en-US"), never bare languages.
 */
export function normalizeLocale(
  raw: string | null | undefined,
): Locale | undefined {
  if (!raw) return undefined;
  try {
    const parsed = new Intl.Locale(raw.trim().replace(/_/g, "-"));
    const language = parsed.language?.toLowerCase();
    const region = parsed.region?.toUpperCase();
    if (!language || !region) return undefined;
    return `${language}-${region}` as Locale;
  } catch {
    return undefined;
  }
}

function parse(locale: string): Intl.Locale | undefined {
  try {
    return new Intl.Locale(locale.trim().replace(/_/g, "-"));
  } catch {
    return undefined;
  }
}

/** The lowercase language subtag of a locale, e.g. "en" for "en-US". */
export function localeLanguage(locale: string): Language | undefined {
  return parse(locale)?.language?.toLowerCase();
}

/** The uppercase region subtag of a locale, e.g. "US" for "en-US". */
export function localeRegion(locale: string): Region | undefined {
  return parse(locale)?.region?.toUpperCase();
}

/** Build a candidate locale from a language and region, if both are present. */
export function joinLocale(
  language: string | undefined,
  region: string | undefined,
): Locale | undefined {
  return language && region
    ? normalizeLocale(`${language}-${region}`)
    : undefined;
}
