import { describe, expect, test } from "bun:test";
import { geolocate } from "../src/geolocate.ts";
import { blueprintConfig, GOOGLEBOT, makeRequest } from "./helpers.ts";

describe("geolocate", () => {
  test("reads Vercel geo headers", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "x-vercel-ip-country": "SE" },
    });
    expect(await geolocate(request, blueprintConfig)).toEqual({ region: "SE" });
  });

  test("reads Cloudflare geo headers and normalizes casing", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "cf-ipcountry": "no" },
    });
    expect(await geolocate(request, blueprintConfig)).toEqual({ region: "NO" });
  });

  test("prefers the first available geo header", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "x-vercel-ip-country": "SE", "cf-ipcountry": "NO" },
    });
    expect(await geolocate(request, blueprintConfig)).toEqual({ region: "SE" });
  });

  test("bots skip geolocation", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "x-vercel-ip-country": "SE" },
      userAgent: GOOGLEBOT,
    });
    expect(await geolocate(request, blueprintConfig)).toBeNull();
  });

  test("the bypass cookie skips geolocation", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "x-vercel-ip-country": "SE" },
      cookies: { "X-BYPASS-GEOLOCATION": "1" },
    });
    expect(await geolocate(request, blueprintConfig)).toBeNull();
  });

  test("no geo headers at all → null (negotiation fallback)", async () => {
    const request = makeRequest("https://example.com/");
    expect(await geolocate(request, blueprintConfig)).toBeNull();
  });
});
