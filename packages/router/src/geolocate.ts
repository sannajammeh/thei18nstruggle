import { RequestCookies } from "@edge-runtime/cookies";
import { BYPASS_COOKIE } from "./cookies.ts";
import { isCrawler } from "./crawler.ts";
import type { GeoHint, Routing, RouterRequest } from "./types.ts";

export type Geolocate = (
  request: RouterRequest,
  config: Routing,
) => Promise<GeoHint | null>;

/** Edge/host geo headers, in priority order. */
const REGION_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
  "x-geo-country",
];

/**
 * Resolve the geolocation hint for a request, or null when geolocation is
 * skipped — in which case routing falls back to the locale cookie and
 * negotiation. Geolocation is skipped for:
 *
 * - crawler user agents (crawlers are never geo-routed),
 * - visitors carrying the bypass cookie (`X-BYPASS-GEOLOCATION`),
 * - requests with no geo headers at all.
 */
export async function geolocate(
  request: RouterRequest,
  _config?: Routing,
): Promise<GeoHint | null> {
  const headers = request.headers;
  if (isCrawler(headers.get("user-agent"))) return null;
  if (new RequestCookies(headers).has(BYPASS_COOKIE)) return null;

  for (const header of REGION_HEADERS) {
    const value = headers.get(header);
    if (value) return { region: value.trim().toUpperCase() };
  }
  return null;
}
