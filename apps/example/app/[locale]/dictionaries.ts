import { localeLanguage } from "@concept/router";
import { notFound } from "next/navigation";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  sv: () => import("./dictionaries/sv.json").then((module) => module.default),
  fr: () => import("./dictionaries/fr.json").then((module) => module.default),
} as const;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

/** Dictionaries are keyed by language: every market in a group shares the same copy. */
export async function getDictionary(locale: string): Promise<Dictionary> {
  const language = localeLanguage(locale);
  if (!language || !(language in dictionaries)) notFound();
  return dictionaries[language as keyof typeof dictionaries]();
}
