"use client";

import {
  joinLocale,
  type Locale,
  localizePath,
  parseLocale,
  resolveCookies,
} from "@concept/router";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { routing } from "@/i18n/config";
import { clearCookie, setCookie } from "./js-cookie";

export interface SelectorLabels {
  language: string;
  country: string;
  apply: string;
  reset: string;
}

interface LocaleSelectorProps {
  locale: Locale;
  labels: SelectorLabels;
}

function languageOptions(): { language: string; regions: string[] }[] {
  const options = new Map<string, string[]>();
  for (const locale of routing.locales) {
    const { language, region } = parseLocale(locale) ?? {};
    if (!language || !region) continue;
    const regions = options.get(language);
    if (regions) {
      if (!regions.includes(region)) regions.push(region);
    } else {
      options.set(language, [region]);
    }
  }
  return [...options].map(([language, regions]) => ({ language, regions }));
}

const options = languageOptions();

function displayName(
  locale: string,
  type: Intl.DisplayNamesType,
  code: string,
): string {
  try {
    return new Intl.DisplayNames([locale], { type }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function LocaleSelector({ locale, labels }: LocaleSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const cookies = resolveCookies(routing);

  const parsed = parseLocale(locale);
  const [language, setLanguage] = useState(parsed?.language);
  const [region, setRegion] = useState(parsed?.region);

  const pending = joinLocale(language, region);
  const valid = pending !== undefined && routing.locales.includes(pending);
  const dirty = valid && pending !== locale;
  const activeRegions =
    options.find((option) => option.language === language)?.regions ?? [];

  function onLanguageChange(next: string) {
    const regions =
      options.find((option) => option.language === next)?.regions ?? [];
    setLanguage(next);
    if (!region || !regions.includes(region)) setRegion(regions[0]);
  }

  function apply() {
    if (!pending) return;
    setCookie(cookies.locale, pending, cookies.localeMaxAge);
    // Explicit choice wins over geo-routing: pin the market for bypassMaxAge.
    setCookie(cookies.bypass, "1", cookies.bypassMaxAge);
    router.push(localizePath(pathname, pending, routing));
  }

  function reset() {
    clearCookie(cookies.locale);
    clearCookie(cookies.bypass);
    router.push("/");
  }

  const selectClass =
    "rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground";

  return (
    <div className="w-full max-w-md rounded-xl border border-line bg-panel p-4 text-left">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-xs text-dim">
          {labels.language}
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            className={selectClass}
          >
            {options.map((option) => (
              <option key={option.language} value={option.language}>
                {displayName(locale, "language", option.language)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-dim">
          {labels.country}
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className={selectClass}
          >
            {activeRegions.map((code) => (
              <option key={code} value={code}>
                {displayName(locale, "region", code)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={apply}
          disabled={!dirty}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
        >
          {labels.apply}
        </button>
      </div>
      <button
        type="button"
        onClick={reset}
        className="mt-3 text-xs text-dim underline underline-offset-2 hover:text-foreground"
      >
        {labels.reset}
      </button>
    </div>
  );
}
