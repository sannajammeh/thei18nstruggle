import { describe, expect, test } from "bun:test";
import { getOutcome } from "../src/outcome.ts";
import type { Routing } from "../src/types.ts";
import {
  blueprintConfig,
  flexibleConfig,
  GOOGLEBOT,
  makeRequest,
} from "./helpers.ts";

const initialConfig = { ...blueprintConfig, geolocation: "initial" as const };

describe("getOutcome", () => {
  test("crawlers are never redirected; unprefixed root rewrites to the default subtree", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "x-vercel-ip-country": "SE", "accept-language": "en" },
      userAgent: GOOGLEBOT,
    });
    const outcome = await getOutcome(
      request,
      { geo: { region: "SE" }, locale: "en-US" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("rewrite");
    expect(outcome.setCookie).toBe(false);
    expect(outcome.locale).toBe("en-US");
    expect(outcome.url).toBe("https://example.com/en-US");
  });

  test("crawlers get default content on any unprefixed path", async () => {
    const request = makeRequest("https://example.com/products", {
      userAgent: GOOGLEBOT,
    });
    const outcome = await getOutcome(
      request,
      { geo: null, locale: "en-US" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("rewrite");
    expect(outcome.url).toBe("https://example.com/en-US/products");
  });

  test("crawlers on explicit locale URLs are served as requested", async () => {
    const request = makeRequest("https://example.com/sv-SE", {
      userAgent: GOOGLEBOT,
    });
    const outcome = await getOutcome(
      request,
      { geo: null, locale: "en-US" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("none");
    expect(outcome.locale).toBe("sv-SE");
  });

  test("geo is the arbiter of truth for the region: en-NO accept + SE geo → en-SE", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "accept-language": "en-NO,en;q=0.9" },
    });
    const outcome = await getOutcome(
      request,
      { geo: { region: "SE" }, locale: "en-NO" },
      blueprintConfig,
    );
    expect(outcome).toEqual({
      type: "redirect",
      status: 307,
      setCookie: true,
      locale: "en-SE",
      url: "https://example.com/en-SE",
    });
  });

  test("preserves the rest of the path and the query when geo-routing", async () => {
    const request = makeRequest("https://example.com/products?sort=price", {
      headers: { "accept-language": "sv-SE" },
    });
    const outcome = await getOutcome(
      request,
      { geo: { region: "SE" }, locale: "sv-SE" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("redirect");
    expect(outcome.locale).toBe("sv-SE");
    expect(outcome.url).toBe("https://example.com/sv-SE/products?sort=price");
  });

  test("geo target equal to default locale renders the root subtree and remembers", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "accept-language": "en" },
    });
    const outcome = await getOutcome(
      request,
      { geo: { region: "US" }, locale: "en-US" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("rewrite");
    expect(outcome.url).toBe("https://example.com/en-US");
    expect(outcome.locale).toBe("en-US");
    expect(outcome.setCookie).toBe(true);
  });

  test("unsupported geo/language combinations fall back to the negotiated locale", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "accept-language": "en" },
    });
    const outcome = await getOutcome(
      request,
      { geo: { region: "CN" }, locale: "en-US" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("rewrite");
    expect(outcome.url).toBe("https://example.com/en-US");
    expect(outcome.locale).toBe("en-US");
  });

  test("explicit locale URLs are served as requested", async () => {
    const request = makeRequest("https://example.com/en-SE/products");
    const outcome = await getOutcome(
      request,
      { geo: { region: "NO" }, locale: "en-NO" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("none");
    expect(outcome.locale).toBe("en-SE");
    expect(outcome.setCookie).toBe(false);
  });

  test("non-GET requests are never redirected; unprefixed ones rewrite", async () => {
    const request = makeRequest("https://example.com/", { method: "POST" });
    const outcome = await getOutcome(
      request,
      { geo: { region: "SE" }, locale: "en-US" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("rewrite");
    expect(outcome.url).toBe("https://example.com/en-US");
  });

  test("invalid cookie values are ignored", async () => {
    const request = makeRequest("https://example.com/", {
      cookies: { NEXT_LOCALE: "xx-XX" },
      headers: { "accept-language": "en" },
    });
    const outcome = await getOutcome(
      request,
      { geo: { region: "SE" }, locale: "en-US" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("redirect");
    expect(outcome.locale).toBe("en-SE");
  });
});

describe("geolocation: force (default)", () => {
  test("overrides the region of a stored preference, no matter what", async () => {
    const request = makeRequest("https://example.com/products", {
      cookies: { NEXT_LOCALE: "sv-SE" },
      headers: { "accept-language": "sv-SE" },
    });
    const outcome = await getOutcome(
      request,
      { geo: { region: "NO" }, locale: "sv-SE" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("redirect");
    expect(outcome.locale).toBe("sv-NO");
    expect(outcome.url).toBe("https://example.com/sv-NO/products");
    expect(outcome.setCookie).toBe(true); // cookie refreshed to the geo truth
  });

  test("does not re-cookie when geo agrees with the preference", async () => {
    const request = makeRequest("https://example.com/", {
      cookies: { NEXT_LOCALE: "en-US" },
      headers: { "accept-language": "en" },
    });
    const outcome = await getOutcome(
      request,
      { geo: { region: "US" }, locale: "en-US" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("rewrite");
    expect(outcome.url).toBe("https://example.com/en-US");
    expect(outcome.setCookie).toBe(false);
  });
});

describe("geolocation: initial", () => {
  test("an existing locale cookie wins over the geo region", async () => {
    const request = makeRequest("https://example.com/products", {
      cookies: { NEXT_LOCALE: "sv-SE" },
      headers: { "accept-language": "sv-SE" },
    });
    const outcome = await getOutcome(
      request,
      { geo: { region: "NO" }, locale: "sv-SE" },
      initialConfig,
    );
    expect(outcome.type).toBe("redirect");
    expect(outcome.locale).toBe("sv-SE");
    expect(outcome.url).toBe("https://example.com/sv-SE/products");
    expect(outcome.setCookie).toBe(false);
  });

  test("applies geo while no preference exists", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "accept-language": "sv-SE" },
    });
    const outcome = await getOutcome(
      request,
      { geo: { region: "NO" }, locale: "sv-SE" },
      initialConfig,
    );
    expect(outcome.type).toBe("redirect");
    expect(outcome.locale).toBe("sv-NO");
  });
});

describe("without geolocation", () => {
  // geo null = geolocate skipped: routing falls back to the cookie, then negotiation.
  test("a stored preference is respected", async () => {
    const request = makeRequest("https://example.com/products", {
      cookies: { NEXT_LOCALE: "sv-SE" },
    });
    const outcome = await getOutcome(
      request,
      { geo: null, locale: "en-US" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("redirect");
    expect(outcome.url).toBe("https://example.com/sv-SE/products");
    expect(outcome.setCookie).toBe(false); // already stored
  });

  test("preference for the default locale rewrites the root subtree", async () => {
    const request = makeRequest("https://example.com/", {
      cookies: { NEXT_LOCALE: "en-US" },
    });
    const outcome = await getOutcome(
      request,
      { geo: null, locale: "en-US" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("rewrite");
    expect(outcome.url).toBe("https://example.com/en-US");
  });

  test("cookie names and redirect status are configurable", async () => {
    const config: Routing = {
      ...blueprintConfig,
      cookies: { locale: "MARKET", redirectStatus: 307 },
    };
    const request = makeRequest("https://example.com/", {
      cookies: { MARKET: "sv-SE" },
    });
    const outcome = await getOutcome(
      request,
      { geo: null, locale: "en-US" },
      config,
    );
    expect(outcome.type).toBe("redirect");
    expect(outcome.url).toBe("https://example.com/sv-SE");
  });

  test("negotiation alone decides the target, without pinning a cookie", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "accept-language": "sv-SE" },
    });
    const outcome = await getOutcome(
      request,
      { geo: null, locale: "sv-SE" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("redirect");
    expect(outcome.locale).toBe("sv-SE");
    expect(outcome.setCookie).toBe(false);
  });

  test("negotiated default locale rewrites the root subtree", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "accept-language": "en" },
    });
    const outcome = await getOutcome(
      request,
      { geo: null, locale: "en-US" },
      blueprintConfig,
    );
    expect(outcome.type).toBe("rewrite");
    expect(outcome.url).toBe("https://example.com/en-US");
    expect(outcome.setCookie).toBe(false);
  });
});

describe("getOutcome with localePrefix: always", () => {
  test("default target rewrites unprefixed paths internally", async () => {
    const request = makeRequest("https://example.com/products", {
      headers: { "accept-language": "en" },
    });
    const outcome = await getOutcome(
      request,
      { geo: { region: "US" }, locale: "en-US" },
      flexibleConfig("always"),
    );
    expect(outcome.type).toBe("rewrite");
    expect(outcome.url).toBe("https://example.com/en-US/products");
    expect(outcome.locale).toBe("en-US");
  });

  test("non-default targets still redirect", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "accept-language": "en" },
    });
    const outcome = await getOutcome(
      request,
      { geo: { region: "SE" }, locale: "en-US" },
      flexibleConfig("always"),
    );
    expect(outcome.type).toBe("redirect");
    expect(outcome.url).toBe("https://example.com/en-SE");
  });
});
