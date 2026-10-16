import type { Locale } from "@concept/router";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/config";
import { getDictionary } from "./dictionaries";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        {dict.home.title}
      </h1>
      <p className="max-w-md text-dim">{dict.home.description}</p>
      <div className="vig vig-top" aria-hidden="true" />
      <div className="vig vig-bottom" aria-hidden="true" />
    </main>
  );
}
