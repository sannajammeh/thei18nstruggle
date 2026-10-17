import type { Locale } from "@concept/router";

/** The commercial layer Google never sees: same document, different money. */
export const marketCurrency: Record<Locale, string> = {
  "en-US": "USD",
  "en-GB": "GBP",
  "en-IE": "EUR",
  "en-SE": "SEK",
  "en-NO": "NOK",
  "en-DK": "DKK",
  "en-CA": "CAD",
  "en-AU": "AUD",
  "sv-SE": "SEK",
  "sv-NO": "NOK",
  "sv-FI": "EUR",
  "fr-FR": "EUR",
  "fr-BE": "EUR",
  "fr-CA": "CAD",
  "de-DE": "EUR",
  "de-AT": "EUR",
  "de-CH": "CHF",
};
