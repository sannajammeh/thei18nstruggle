import { describe, expect, test } from "bun:test";
import { isCommercialOnly } from "../src/groups.ts";
import { localePath } from "../src/path.ts";
import {
  hreflangAlternates,
  indexableLocales,
  isIndexable,
} from "../src/seo.ts";
import { blueprintConfig, flexibleConfig } from "./helpers.ts";

describe("indexable derivation", () => {
  test("derives indexable locales per the blueprint", () => {
    // Group canonicals first (in group order), then uniques in locale order.
    // fr-BE/fr-CA are in `locales` but covered by no group, so they are unique
    // markets per the derivation rule ("every locale not covered by any
    // group's members"), even though the blueprint's example result omits them.
    expect(indexableLocales(blueprintConfig)).toEqual([
      "en-US",
      "sv-SE",
      "fr-FR",
      "en-FR",
      "fr-BE",
      "fr-CA",
    ]);
  });

  test("wildcard model collapses to canonicals plus excluded uniques", () => {
    expect(indexableLocales(flexibleConfig())).toEqual([
      "en-US",
      "sv-SE",
      "fr-FR",
      "en-FR",
    ]);
  });
});

describe("seo utilities", () => {
  test("commercial-only locales canonicalize back to their group", () => {
    expect(isCommercialOnly(blueprintConfig, "en-SE")).toBe(true);
    expect(isCommercialOnly(blueprintConfig, "sv-NO")).toBe(true);
    expect(isCommercialOnly(blueprintConfig, "en-FR")).toBe(false);
    expect(isIndexable(blueprintConfig, "en-SE")).toBe(false);
    expect(isIndexable(blueprintConfig, "en-FR")).toBe(true);
  });

  test("hreflang cluster contains only indexables plus x-default at the root", () => {
    const alternates = hreflangAlternates(
      blueprintConfig,
      "https://example.com",
    );
    expect(alternates[0]).toEqual({
      hreflang: "x-default",
      href: "https://example.com/",
    });
    const hreflangs = alternates
      .filter((a) => a.hreflang !== "x-default")
      .map((a) => a.hreflang);
    expect(hreflangs).toEqual(indexableLocales(blueprintConfig));
    // Commercial-only locales never appear.
    expect(hreflangs).not.toContain("en-SE");
    expect(hreflangs).not.toContain("sv-NO");
    // Unique markets keep their full locale tag.
    expect(hreflangs).toContain("en-FR");
  });

  test("alternates and localized paths honor localePrefix", () => {
    const alternates = hreflangAlternates(
      flexibleConfig(),
      "https://example.com/",
    );
    const svSE = alternates.find((a) => a.hreflang === "sv-SE");
    expect(svSE?.href).toBe("https://example.com/sv-SE");
    const enUS = alternates.find((a) => a.hreflang === "en-US");
    expect(enUS?.href).toBe("https://example.com/");
    expect(localePath(flexibleConfig(), "sv-NO")).toBe("/sv-NO");
  });
});
