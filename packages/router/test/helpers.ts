import type { Routing, RouterRequest } from "../src/types.ts";

/**
 * The blueprint's example configuration. Note en-DE/en-NL appear as members
 * but are not in `locales` — they must be ignored, not fatal.
 */
export const blueprintConfig: Routing = {
  defaultLocale: "en-US",
  locales: [
    "en-US",
    "en-SE",
    "en-NO",
    "en-GB",
    "en-FR",
    "sv-SE",
    "sv-NO",
    "fr-FR",
    "fr-BE",
    "fr-CA",
  ],
  groups: [
    {
      language: "en",
      canonicalLocale: "en-US",
      members: ["en-US", "en-SE", "en-NO", "en-GB", "en-DE", "en-NL"],
      exclude: ["en-FR"],
    },
    {
      language: "sv",
      canonicalLocale: "sv-SE",
      members: ["sv-SE", "sv-NO"],
    },
    {
      language: "fr",
      canonicalLocale: "fr-FR",
      members: ["fr-FR"],
    },
  ],
};

/** The blueprint's optional "flexible wildcard model". */
export function flexibleConfig(
  localePrefix: Routing["localePrefix"] = "as-needed",
): Routing {
  const countries = ["US", "SE", "NO", "GB", "FR", "DE", "NL", "BE", "CA"];
  const languages = ["en", "sv", "fr"];
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
        exclude: ["en-FR"],
      },
      { language: "sv", canonicalLocale: "sv-SE", members: ["sv-*"] },
      {
        language: "fr",
        canonicalLocale: "fr-FR",
        members: ["fr-*"],
        exclude: ["fr-FR"],
      },
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
): RouterRequest {
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
  return { url, headers, method: init.method };
}

export const GOOGLEBOT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
