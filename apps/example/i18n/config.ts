import type { Routing } from "@concept/router";

export const routing: Routing = {
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
  geolocation: "force",
  localePrefix: "as-needed",
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
