import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { resolveLocales } from "./groups.ts";
import type { Routing, Locale, RouterRequest } from "./types.ts";

export type Negotiate = (
  request: RouterRequest,
  config: Routing,
) => Promise<Locale>;

/**
 * Resolve the requested locale from the Accept-Language header
 * (parsed by `negotiator`, matched with CLDR-style fallback via
 * `@formatjs/intl-localematcher`). Falls back to the default locale.
 *
 * The language is always decided by the browser; region-level corrections
 * happen later, in `getOutcome`, from geolocation.
 */
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
