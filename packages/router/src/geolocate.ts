import { RequestCookies } from "@edge-runtime/cookies";
import { BYPASS_COOKIE } from "./cookies.ts";
import { isCrawler } from "./crawler.ts";
import type { GeoHint, RouterRequest, Routing } from "./types.ts";

export type Geolocate = (
  request: RouterRequest,
  config: Routing,
) => Promise<GeoHint | null>;

const REGION_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
  "x-geo-country",
];

/**
 * Returns null when geolocation is skipped — routing then falls back to the
 * locale cookie and negotiation.
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
