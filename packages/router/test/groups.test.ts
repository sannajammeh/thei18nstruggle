import { describe, expect, test } from "bun:test";
import {
  canonicalLocale,
  isConsolidated,
  languageGroup,
  localeGroup,
  resolveGroups,
  resolveLocales,
} from "../src/groups.ts";
import type { Locale, Routing } from "../src/types.ts";
import { blueprintConfig, flexibleConfig } from "./helpers.ts";

describe("resolveLocales", () => {
  test("normalizes casing and dedupes", () => {
    const locales = resolveLocales({
      defaultLocale: "en-us",
      locales: ["en-us", "EN-SE", "en-us", "sv-se"],
      groups: [],
    });
    expect(locales).toEqual(["en-US", "en-SE", "sv-SE"]);
  });

  test("rejects invalid locales and bad defaults", () => {
    expect(() =>
      resolveLocales({
        defaultLocale: "en-US",
        locales: ["en" as Locale],
        groups: [],
      }),
    ).toThrow();
    expect(() =>
      resolveLocales({ defaultLocale: "en-US", locales: [], groups: [] }),
    ).toThrow();
    expect(() =>
      resolveLocales({
        defaultLocale: "sv-SE",
        locales: ["en-US"],
        groups: [],
      }),
    ).toThrow();
  });
});

describe("resolveGroups", () => {
  test("drops members that are not in locales", () => {
    const config: Routing = {
      defaultLocale: "en-US",
      locales: ["en-US", "en-SE"],
      groups: [
        {
          language: "en",
          canonicalLocale: "en-US",
          members: ["en-US", "en-SE", "en-DE"],
        },
      ],
    };
    const [en] = resolveGroups(config);
    expect(en?.members).toEqual(["en-US", "en-SE"]);
  });

  test("resolves the blueprint's market groups", () => {
    const [en, sv, fr, de] = resolveGroups(blueprintConfig);
    expect(en?.canonicalLocale).toBe("en-US");
    expect(en?.members).toEqual([
      "en-US",
      "en-GB",
      "en-IE",
      "en-SE",
      "en-NO",
      "en-DK",
      "en-CA",
    ]);
    expect(sv?.members).toEqual(["sv-SE", "sv-NO", "sv-FI"]);
    expect(fr?.members).toEqual(["fr-FR", "fr-BE"]);
    expect(de?.members).toEqual(["de-DE", "de-AT", "de-CH"]);
  });

  test("expands wildcards and applies excludes (flexible model)", () => {
    const [en, sv, fr] = resolveGroups(flexibleConfig());
    expect(en?.members).toEqual(
      flexibleConfig().locales.filter(
        (locale) => locale.startsWith("en-") && locale !== "en-AU",
      ),
    );
    expect(fr?.members).not.toContain("fr-CA"); // excluded from the wildcard
    expect(sv?.members).toContain("sv-NO");
    expect(sv?.members).toContain("sv-FI");
  });

  test("rejects unknown canonical locales", () => {
    expect(() =>
      resolveGroups({
        defaultLocale: "en-US",
        locales: ["en-US"],
        groups: [
          { language: "en", canonicalLocale: "en-XX", members: ["en-US"] },
        ],
      }),
    ).toThrow();
  });
});

describe("group lookups", () => {
  test("localeGroup, languageGroup, canonicalLocale, isConsolidated", () => {
    expect(localeGroup(blueprintConfig, "en-SE")?.canonicalLocale).toBe(
      "en-US",
    );
    expect(languageGroup(blueprintConfig, "sv")?.canonicalLocale).toBe("sv-SE");
    expect(canonicalLocale(blueprintConfig, "en-SE")).toBe("en-US");
    expect(canonicalLocale(blueprintConfig, "en-AU")).toBe("en-AU"); // unique → itself
    expect(canonicalLocale(blueprintConfig, "en-US")).toBe("en-US");
    expect(isConsolidated(blueprintConfig, "en-SE")).toBe(true);
    expect(isConsolidated(blueprintConfig, "de-CH")).toBe(true);
    expect(isConsolidated(blueprintConfig, "fr-CA")).toBe(false);
    expect(isConsolidated(flexibleConfig(), "sv-NO")).toBe(true);
    expect(localeGroup(blueprintConfig, "xx-XX")).toBeUndefined();
  });
});
