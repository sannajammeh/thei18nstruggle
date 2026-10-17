import { describe, expect, test } from "bun:test";
import {
  localePath,
  localizePath,
  matchLocalePath,
  stripLocalePrefix,
  withLocalePrefix,
} from "../src/path.ts";
import type { Routing } from "../src/types.ts";

describe("path utilities", () => {
  const locales = ["en-US", "sv-SE", "en-FR"] as const;

  test("detects configured locale prefixes", () => {
    expect(matchLocalePath("/sv-SE/products", locales)).toEqual({
      locale: "sv-SE",
      rest: "/products",
    });
    expect(matchLocalePath("/sv-se", locales)).toEqual({
      locale: "sv-SE",
      rest: "",
    });
    expect(matchLocalePath("/", locales)).toBeNull();
    expect(matchLocalePath("/en/products", locales)).toBeNull(); // language-only paths are not allowed
    expect(matchLocalePath("/unknown/products", locales)).toBeNull();
  });

  test("prefixes per localePrefix strategy", () => {
    const asNeeded = {
      defaultLocale: "en-US" as const,
      localePrefix: "as-needed" as const,
    };
    expect(withLocalePrefix("/", "sv-SE", asNeeded)).toBe("/sv-SE");
    expect(withLocalePrefix("/products", "sv-SE", asNeeded)).toBe(
      "/sv-SE/products",
    );
    expect(withLocalePrefix("/products", "en-US", asNeeded)).toBe("/products");
    expect(withLocalePrefix("/", "en-US", asNeeded)).toBe("/");

    const always = {
      defaultLocale: "en-US" as const,
      localePrefix: "always" as const,
    };
    expect(withLocalePrefix("/products", "en-US", always)).toBe(
      "/en-US/products",
    );
  });

  test("strips locale prefixes", () => {
    expect(stripLocalePrefix("/sv-SE/products", locales)).toEqual({
      pathname: "/products",
      locale: "sv-SE",
    });
    expect(stripLocalePrefix("/sv-SE", locales)).toEqual({
      pathname: "/",
      locale: "sv-SE",
    });
    expect(stripLocalePrefix("/products", locales)).toEqual({
      pathname: "/products",
      locale: null,
    });
  });

  test("localePath builds with config last", () => {
    const config: Routing = {
      defaultLocale: "en-US",
      locales: [...locales],
      groups: [],
    };
    expect(localePath("/", "sv-SE", config)).toBe("/sv-SE");
    expect(localePath("/products", "en-US", config)).toBe("/products");
  });

  test("localizes a pathname to another locale", () => {
    const config: Routing = {
      defaultLocale: "en-US",
      locales: [...locales],
      groups: [],
    };
    // prefixed → re-prefixed
    expect(localizePath("/en-FR/products", "sv-SE", config)).toBe(
      "/sv-SE/products",
    );
    // unprefixed → prefixed
    expect(localizePath("/products", "sv-SE", config)).toBe("/sv-SE/products");
    // to the default locale under as-needed → unprefixed
    expect(localizePath("/sv-SE/products", "en-US", config)).toBe("/products");
    // unknown first segment passes through untouched
    expect(localizePath("/api/keys", "sv-SE", config)).toBe("/sv-SE/api/keys");
  });
});
