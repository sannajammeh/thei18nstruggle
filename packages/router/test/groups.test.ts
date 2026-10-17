import { describe, expect, test } from "bun:test";
import {
  canonicalLocale,
  isConsolidated,
  languageGroup,
  localeGroup,
  resolveGroups,
  resolveLocales,
} from "../src/groups.ts";
import type { Locale } from "../src/types.ts";
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
    const [en] = resolveGroups(blueprintConfig);
    expect(en?.canonicalLocale).toBe("en-US");
    expect(en?.members).toEqual(["en-US", "en-SE", "en-NO", "en-GB"]);
  });

  test("expands wildcards and applies excludes (flexible model)", () => {
    const [en, sv, fr] = resolveGroups(flexibleConfig());
    expect(en?.members).toEqual(
      flexibleConfig().locales.filter(
        (locale) => locale.startsWith("en-") && locale !== "en-FR",
      ),
    );
    expect(fr?.members).not.toContain("fr-FR"); // excluded from its own wildcard
    expect(sv?.members).toContain("sv-NO");
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
    expect(canonicalLocale(blueprintConfig, "en-FR")).toBe("en-FR"); // unique → itself
    expect(canonicalLocale(blueprintConfig, "en-US")).toBe("en-US");
    expect(isConsolidated(blueprintConfig, "en-SE")).toBe(true);
    expect(isConsolidated(blueprintConfig, "en-FR")).toBe(false);
    expect(isConsolidated(flexibleConfig(), "sv-NO")).toBe(true);
    expect(localeGroup(blueprintConfig, "xx-XX")).toBeUndefined();
  });
});
