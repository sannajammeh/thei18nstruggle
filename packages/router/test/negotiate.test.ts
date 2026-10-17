import { describe, expect, test } from "bun:test";
import { negotiate } from "../src/negotiate.ts";
import { blueprintConfig, makeRequest } from "./helpers.ts";

describe("negotiate", () => {
  test("returns the exact configured locale when matched", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "accept-language": "en-NO,en;q=0.9" },
    });
    expect(await negotiate(request, blueprintConfig)).toBe("en-NO");
  });

  test("falls back to the first configured locale of the language", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "accept-language": "en;q=0.9" },
    });
    expect(await negotiate(request, blueprintConfig)).toBe("en-US");
  });

  test("matches region-qualified requests against configured locales", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "accept-language": "fr-BE,fr;q=0.8" },
    });
    expect(await negotiate(request, blueprintConfig)).toBe("fr-BE");
  });

  test("returns the default locale when nothing matches", async () => {
    const empty = makeRequest("https://example.com/");
    expect(await negotiate(empty, blueprintConfig)).toBe("en-US");
    const wildcard = makeRequest("https://example.com/", {
      headers: { "accept-language": "*" },
    });
    expect(await negotiate(wildcard, blueprintConfig)).toBe("en-US");
    const unsupported = makeRequest("https://example.com/", {
      headers: { "accept-language": "ja-JP" },
    });
    expect(await negotiate(unsupported, blueprintConfig)).toBe("en-US");
  });

  test("intl-localematcher region affinity: unsupported language falls back to a same-region locale", async () => {
    // CLDR-style matching: no Norwegian content exists, so a Norwegian browser
    // is served the English variant of their own market rather than en-US.
    const request = makeRequest("https://example.com/", {
      headers: { "accept-language": "nb-NO" },
    });
    expect(await negotiate(request, blueprintConfig)).toBe("en-NO");
  });

  test("honors quality ordering", async () => {
    const request = makeRequest("https://example.com/", {
      headers: { "accept-language": "en;q=0.5, sv-SE" },
    });
    expect(await negotiate(request, blueprintConfig)).toBe("sv-SE");
  });
});
