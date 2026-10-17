import { describe, expect, test } from "bun:test";
import { isConsolidated } from "../src/groups.ts";
import { localePath } from "../src/path.ts";
import {
  getHtmlLang,
  hreflangAlternates,
  indexableLocales,
  isIndexable,
} from "../src/seo.ts";
import { blueprintConfig, flexibleConfig } from "./helpers.ts";

describe("indexable derivation", () => {
  test("derives indexable locales per the blueprint: 16 markets collapse to 6 documents", () => {
    expect(indexableLocales(blueprintConfig)).toEqual([
      "en-US",
      "sv-SE",
      "fr-FR",
      "de-DE",
      "en-AU",
      "fr-CA",
    ]);
  });

  test("wildcard model collapses to canonicals plus excluded uniques", () => {
    expect(indexableLocales(flexibleConfig())).toEqual([
      "en-US",
      "sv-SE",
      "fr-FR",
      "de-DE",
      "en-AU",
      "fr-CA",
    ]);
  });
});

describe("seo utilities", () => {
  test("consolidated locales canonicalize back to their group", () => {
    expect(isConsolidated(blueprintConfig, "en-SE")).toBe(true);
    expect(isConsolidated(blueprintConfig, "en-CA")).toBe(true);
    expect(isConsolidated(blueprintConfig, "sv-NO")).toBe(true);
    expect(isConsolidated(blueprintConfig, "de-AT")).toBe(true);
    expect(isConsolidated(blueprintConfig, "en-AU")).toBe(false);
    expect(isIndexable(blueprintConfig, "en-SE")).toBe(false);
    expect(isIndexable(blueprintConfig, "en-AU")).toBe(true);
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
    expect(hreflangs).not.toContain("en-SE");
    expect(hreflangs).not.toContain("sv-NO");
    expect(hreflangs).not.toContain("de-AT");
    // Unique markets keep their full locale tag.
    expect(hreflangs).toContain("en-AU");
    expect(hreflangs).toContain("fr-CA");
  });

  test("html lang carries the full tag for indexable markets, bare language for grouped", () => {
    expect(getHtmlLang("en-US", blueprintConfig)).toBe("en-US");
    expect(getHtmlLang("sv-SE", blueprintConfig)).toBe("sv-SE");
    expect(getHtmlLang("de-DE", blueprintConfig)).toBe("de-DE");
    expect(getHtmlLang("en-AU", blueprintConfig)).toBe("en-AU");
    expect(getHtmlLang("en-SE", blueprintConfig)).toBe("en");
    expect(getHtmlLang("en-CA", blueprintConfig)).toBe("en");
    expect(getHtmlLang("sv-NO", blueprintConfig)).toBe("sv");
    expect(getHtmlLang("de-CH", blueprintConfig)).toBe("de");
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
    expect(localePath("/", "sv-NO", flexibleConfig())).toBe("/sv-NO");
  });
});
