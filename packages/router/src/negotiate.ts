import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { resolveLocales } from "./groups.ts";
import type { Locale, RouterRequest, Routing } from "./types.ts";

export type Negotiate = (
  request: RouterRequest,
  config: Routing,
) => Promise<Locale>;

/** The browser decides the language; region-level corrections happen in getOutcome. */
export async function negotiate(
  request: RouterRequest,
  config: Routing,
): Promise<Locale> {
  const languages = new Negotiator({
    headers: {
      "accept-language": request.headers.get("accept-language") ?? "",
    },
  })
    .languages()
    .filter((tag) => tag !== "*");
  if (languages.length === 0) return config.defaultLocale;
  return match(
    languages,
    resolveLocales(config),
    config.defaultLocale,
  ) as Locale;
}
