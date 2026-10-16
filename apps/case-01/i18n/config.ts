import type { Routing } from "@concept/router";

/**
 * Locale configuration derived from the international blueprint (blueprint.md),
 * consumed by `@concept/router`.
 *
 * Locales are always language-country BCP 47 tags, e.g. "en-US", "sv-SE".
 * Language-only paths (such as /sv or /en) are not allowed.
 *
 * The demo set is minimal — one locale per role in the story:
 *
 * - "en-US"  canonical English, served at the root (`localePrefix: "as-needed"`)
 * - "en-SE"  grouped member, commercial-only (noindex, canonical → root)
 * - "en-FR"  excluded from the group, unique and fully indexed
 * - "sv-SE"  the Swedish canonical
 * - "fr-FR"  the French canonical
 */
export const routing: Routing = {
  defaultLocale: "en-US",

  locales: ["en-US", "en-SE", "en-FR", "sv-SE", "fr-FR"],

  groups: [
    {
      language: "en",
      canonicalLocale: "en-US",
      members: ["en-*"],
      exclude: ["en-FR"], // France stays unique
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

/** The locales the platform can operate in, e.g. "en-US". */
export const locales = routing.locales;
