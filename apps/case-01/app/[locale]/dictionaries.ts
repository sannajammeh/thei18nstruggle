import { localeLanguage } from "@concept/router";
import { notFound } from "next/navigation";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  sv: () => import("./dictionaries/sv.json").then((module) => module.default),
  fr: () => import("./dictionaries/fr.json").then((module) => module.default),
} as const;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

/**
 * Loads the dictionary for a locale. Dictionaries are keyed by language so
 * every market of a group (e.g. en-US and en-SE) shares the same copy.
 */
export async function getDictionary(locale: string): Promise<Dictionary> {
  const language = localeLanguage(locale);
  if (!language || !(language in dictionaries)) notFound();
  return dictionaries[language as keyof typeof dictionaries]();
}
