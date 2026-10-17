import type { Routing } from "../src/types.ts";

/** Mirrors the corrected example configuration in blueprint.md §3. */
export const blueprintConfig: Routing = {
  defaultLocale: "en-US",
  locales: [
    "en-US",
    "en-GB",
    "en-IE",
    "en-SE",
    "en-NO",
    "en-DK",
    "en-CA",
    "en-AU",
    "sv-SE",
    "sv-NO",
    "sv-FI",
    "fr-FR",
    "fr-BE",
    "fr-CA",
    "de-DE",
    "de-AT",
    "de-CH",
  ],
  groups: [
    {
      language: "en",
      canonicalLocale: "en-US",
      members: ["en-US", "en-GB", "en-IE", "en-SE", "en-NO", "en-DK", "en-CA"],
      exclude: ["en-AU"],
    },
    {
      language: "sv",
      canonicalLocale: "sv-SE",
      members: ["sv-SE", "sv-NO", "sv-FI"],
    },
    {
      language: "fr",
      canonicalLocale: "fr-FR",
      members: ["fr-FR", "fr-BE"],
      exclude: ["fr-CA"],
    },
    {
      language: "de",
      canonicalLocale: "de-DE",
      members: ["de-DE", "de-AT", "de-CH"],
    },
  ],
};

export function flexibleConfig(
  localePrefix: Routing["localePrefix"] = "as-needed",
): Routing {
  const countries = [
    "US",
    "GB",
    "IE",
    "SE",
    "NO",
    "DK",
    "AU",
    "FI",
    "FR",
    "BE",
    "CA",
    "DE",
    "AT",
    "CH",
  ];
  const languages = ["en", "sv", "fr", "de"];
  return {
    defaultLocale: "en-US",
    locales: countries.flatMap((country) =>
      languages.map((language) => `${language}-${country}` as const),
    ),
    groups: [
      {
        language: "en",
        canonicalLocale: "en-US",
        members: ["en-*"],
        exclude: ["en-AU"],
      },
      { language: "sv", canonicalLocale: "sv-SE", members: ["sv-*"] },
      {
        language: "fr",
        canonicalLocale: "fr-FR",
        members: ["fr-*"],
        exclude: ["fr-CA"],
      },
      { language: "de", canonicalLocale: "de-DE", members: ["de-*"] },
    ],
    localePrefix,
  };
}

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

export function makeRequest(
  url: string,
  init: {
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
    method?: string;
    userAgent?: string | null;
  } = {},
): Request {
  const headers = new Headers(init.headers);
  if (init.userAgent !== null)
    headers.set("user-agent", init.userAgent ?? BROWSER_UA);
  if (init.cookies) {
    headers.set(
      "cookie",
      Object.entries(init.cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join("; "),
    );
  }
  return new Request(url, { method: init.method, headers });
}

export const GOOGLEBOT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
