import type { Locale } from "@concept/router";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { routing } from "@/i18n/config";
import { getDictionary } from "./dictionaries";
import { LocaleSelector } from "./LocaleSelector";
import { SeoExhibit, SeoExhibitFallback } from "./SeoExhibit";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  const dict = await getDictionary(locale);
  const [descriptionBefore, descriptionAfter] =
    dict.home.description.split("{locale}");

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        {dict.home.title}
      </h1>
      <p className="max-w-md text-dim">
        {descriptionBefore}
        {descriptionAfter !== undefined && (
          <>
            <span className="text-accent">{locale}</span>
            {descriptionAfter}
          </>
        )}
      </p>
      <div className="mt-4">
        {/* key remounts the selector on locale change so its selects re-sync */}
        <LocaleSelector
          key={locale}
          locale={locale as Locale}
          labels={dict.selector}
        />
      </div>
      <div className="mt-8 w-full max-w-[720px] text-left">
        <Suspense fallback={<SeoExhibitFallback labels={dict.exhibit} />}>
          <SeoExhibit locale={locale as Locale} labels={dict.exhibit} />
        </Suspense>
      </div>
      <div className="vig vig-bottom" aria-hidden="true" />
    </main>
  );
}
