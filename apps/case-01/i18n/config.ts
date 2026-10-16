import type { Routing } from "@concept/router";

export const routing: Routing = {
  defaultLocale: "en-US",

  locales: ["en-US", "en-SE", "en-FR", "sv-SE", "fr-FR"],

  groups: [
    {
      language: "en",
      canonicalLocale: "en-US",
      members: ["en-*"],
      exclude: ["en-FR"],
    },
    {
      language: "sv",
      canonicalLocale: "sv-SE",
      members: ["sv-*"],
    },
    {
      language: "fr",
      canonicalLocale: "fr-FR",
      members: ["fr-*"],
    },
  ],
};

export const locales = routing.locales;
