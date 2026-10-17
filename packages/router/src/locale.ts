import type { Locale } from "./types.ts";

/**
 * Parses a BCP 47 tag into the platform `Intl.Locale`; underscores are
 * accepted as subtag separators and invalid input yields `undefined`
 * instead of throwing.
 */
export function parseLocale(locale: string): Intl.Locale | undefined {
  try {
    return new Intl.Locale(locale.trim().replace(/_/g, "-"));
  } catch {
    return undefined;
  }
}

export function normalizeLocale(
  raw: string | null | undefined,
): Locale | undefined {
  if (!raw) return undefined;
  const parsed = parseLocale(raw);
  const language = parsed?.language?.toLowerCase();
  const region = parsed?.region?.toUpperCase();
  if (!language || !region) return undefined;
  return `${language}-${region}` as Locale;
}

export function joinLocale(
  language: string | undefined,
  region: string | undefined,
): Locale | undefined {
  return language && region
    ? normalizeLocale(`${language}-${region}`)
    : undefined;
}
