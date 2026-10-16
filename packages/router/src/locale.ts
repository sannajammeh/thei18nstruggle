import type { Language, Locale, Region } from "./types.ts";

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

export function localeLanguage(locale: string): Language | undefined {
  return parse(locale)?.language?.toLowerCase();
}

export function localeRegion(locale: string): Region | undefined {
  return parse(locale)?.region?.toUpperCase();
}

export function joinLocale(
  language: string | undefined,
  region: string | undefined,
): Locale | undefined {
  return language && region
    ? normalizeLocale(`${language}-${region}`)
    : undefined;
}
