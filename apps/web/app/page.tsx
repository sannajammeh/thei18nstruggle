import type { ReactNode } from "react";
import { useId } from "react";
import { highlight } from "sugar-high";

function Dek({ children }: { children: ReactNode }) {
  return (
    <p className="dek mt-6 max-w-[600px] text-[17px] leading-[1.6] text-dim">
      {children}
    </p>
  );
}

function Figure({
  caption,
  status,
  tone,
  code,
  children,
}: {
  caption: string;
  status: string;
  tone?: "bad" | "ok";
  code?: string;
  children?: ReactNode;
}) {
  return (
    <figure className="mt-11 overflow-hidden rounded-lg border border-line bg-panel">
      <figcaption className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
        <span>{caption}</span>
        <span
          className={
            tone === "bad"
              ? "text-accent"
              : tone === "ok"
                ? "text-ok"
                : undefined
          }
        >
          {status}
        </span>
      </figcaption>
      {code !== undefined ? (
        <pre
          className="overflow-x-auto p-4 font-mono text-sm leading-[2]"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: self-authored, syntax-highlighted code samples
          dangerouslySetInnerHTML={{
            __html: highlight(code, { lang: "typescript" }).replace(/\n/g, ""),
          }}
        />
      ) : (
        <pre className="overflow-x-auto p-4 font-mono text-sm leading-[2]">
          {children}
        </pre>
      )}
    </figure>
  );
}

function Line({
  kind = "plain",
  url,
  note,
}: {
  kind?: "bad" | "good" | "no" | "plain" | "muted";
  url: string;
  note?: string;
}) {
  const cls =
    kind === "bad"
      ? "ex ex-bad"
      : kind === "no"
        ? "ex no"
        : kind === "good"
          ? "ex ok"
          : kind === "muted"
            ? "ex muted"
            : "ex";
  return (
    <span className={cls}>
      {url}
      {note ? <span className="cm">{`   ${note}`}</span> : null}
    </span>
  );
}

function Section({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line px-6 py-24">
      <div className="mx-auto max-w-[720px]">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
          {num}
        </p>
        <h2 className="mt-4 text-[clamp(24px,3vw,32px)] font-semibold leading-[1.15] tracking-[-0.02em]">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  const topId = useId();
  const hardId = useId();
  const problemId = useId();
  const seoId = useId();
  const fixId = useId();
  const codeId = useId();

  const nav = [
    [hardId, "hard"],
    [problemId, "problem"],
    [seoId, "seo"],
    [fixId, "the fix"],
    [codeId, "code"],
  ] as const;

  return (
    <>
      <div aria-hidden className="vig vig-top" />
      <div aria-hidden className="vig vig-bottom" />

      <header className="sticky top-0 z-50">
        <div className="mx-auto flex h-[60px] max-w-[720px] items-center justify-between px-6">
          <a
            href={`#${topId}`}
            className="text-[15px] font-bold tracking-tight"
          >
            i18n<span className="text-dim">sucks</span>
          </a>
          <nav className="hidden gap-6 text-[13px] text-dim sm:flex">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="hover:text-accent">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id={topId}>
        {/* hero */}
        <section className="px-6 pb-28 pt-36">
          <div className="mx-auto max-w-[720px]">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-dim">
              an opinion · no framework was harmed
            </p>
            <h1 className="mt-5 text-[clamp(40px,5.5vw,64px)] font-bold leading-[1.04] tracking-[-0.025em]">
              i18n
              <br />
              sucks.
            </h1>
            <Dek>
              Your store needs different prices, currency, and shipping for
              every country. Google needs one clean page per content. Locale
              grouping is the structure that gives both.
            </Dek>
            <div className="mt-11 flex items-center gap-4">
              <a
                href={`#${hardId}`}
                className="rounded-md border border-foreground bg-foreground px-5 py-3 text-sm font-semibold text-background transition-colors hover:border-[#cfcecb] hover:bg-[#cfcecb]"
              >
                Read the diagnosis
              </a>
              <span className="font-mono text-xs text-dim">
                5 min · no signup
              </span>
            </div>
          </div>
        </section>

        <Section
          id={hardId}
          num="01 — i18n is hard"
          title="Everyone underestimates it."
        >
          <Dek>
            International e-commerce has real, non-negotiable requirements:
            every country gets its own prices, currency, shipping rules, and
            availability. The industry&rsquo;s default answer is to spawn an
            indexable locale for every market and hope hreflang sorts it out.
            That default is the bug.
          </Dek>
        </Section>

        <Section
          id={problemId}
          num="02 — the problem"
          title="Your pages compete with themselves."
        >
          <Dek>
            Give every market its own indexed locale and identical content
            multiplies into separate pages. <code>en-SE</code>,{" "}
            <code>en-NO</code> and <code>en-GB</code> carry the same products
            and the same words as <code>en-US</code>. Identical content competes
            on Page Authority: Google picks one winner, and yours splits across
            every market you launch.
          </Dek>
          <Figure
            caption="Exhibit A — the uncollapsed market"
            status="broken"
            tone="bad"
          >
            <Line url="/en-US" note="← indexed" />
            <Line url="/en-SE" note="← indexed, same products, same words" />
            <Line url="/en-NO" note="← indexed, same products, same words" />
            <Line url="/en-GB" note="← indexed, same products, same words" />
            <Line kind="no" url="✗ one page of content, four canonicals" />
          </Figure>
        </Section>

        <Section
          id={seoId}
          num="03 — google seo"
          title="Google reads the mess literally."
        >
          <Dek>
            The crawler doesn&rsquo;t know <code>en-SE</code> is{" "}
            <code>en-US</code> with Swedish prices. Nothing structural says so —
            the URLs are distinct, the content parses as distinct, and the only
            glue is reciprocal hreflang across dozens of locale URLs. Duplicates
            compete for the same queries, signals dilute, and the index fills
            with pages that exist only to hold a price.
          </Dek>
          <Figure caption="Exhibit B — what Google sees" status="index">
            <Line kind="muted" url="$ crawl https://example.com" />
            <Line url="/en-US" note="indexed" />
            <Line kind="no" url="/en-SE" note="duplicate of /en-US" />
            <Line kind="no" url="/en-GB" note="duplicate of /en-US" />
            <Line
              kind="no"
              url="✗ hreflang: every URL points at every other URL"
            />
          </Figure>
        </Section>

        <Section
          id={fixId}
          num="04 — the solution"
          title="Group markets by language."
        >
          <Dek>
            Group content-identical markets by language and collapse each group
            to one indexed canonical. The English group lives at the root — the
            only English URL search engines index. Markets with genuinely
            different products stay unique and fully indexed, carrying the full
            locale in their <code>lang</code> attribute: <code>en-FR</code>, not{" "}
            <code>en</code>. Every other locale still exists — real currency,
            real prices, real shipping — but noindexed, canonicalized back to
            its group, reachable only by humans. Crawlers are never redirected;
            visitors are 307&rsquo;d into their commercial locale and a cookie
            keeps them there.
          </Dek>
          <Figure caption="What search engines see" status="indexed" tone="ok">
            <Line
              kind="good"
              url="example.com"
              note="← en-US · canonical for the English group"
            />
            <Line kind="good" url="/sv-SE" note="← the Swedish canonical" />
            <Line kind="good" url="/fr-FR" note="← the French canonical" />
            <Line
              kind="good"
              url="/en-FR"
              note="← excluded from the group · unique, fully indexed"
            />
            <Line
              kind="muted"
              url="/en-SE …"
              note="commercial-only → noindex, canonical to root"
            />
          </Figure>
          <Figure caption="The canonical policy" status="policy">
            <Line kind="muted" url="URL              indexed   canonical to" />
            <Line url="example.com      yes       itself" />
            <Line url="/sv-SE            yes       itself" />
            <Line url="/fr-FR            yes       itself" />
            <Line url="/en-FR            yes       itself" />
            <Line url="/en-SE            no        example.com" />
          </Figure>
        </Section>

        {/* close */}
        <section
          id={codeId}
          className="scroll-mt-24 border-t border-line px-6 pb-20 pt-28"
        >
          <div className="mx-auto max-w-[720px]">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
              05 — code example
            </p>
            <h2 className="mt-4 text-[clamp(24px,3vw,32px)] font-semibold leading-[1.15] tracking-[-0.02em]">
              Steal the structure.
            </h2>
            <Dek>
              The whole system is one config. Declare your locales, group them
              by language, exclude the unique markets — the indexable set and
              the canonical policy fall out of it.
            </Dek>

            <Figure
              caption="The whole system"
              status="typescript"
              code={`import { createRouter, type Routing } from "@concept/router";

const routing: Routing = {
  defaultLocale: "en-US",

  locales: ["en-US", "en-SE", "en-FR", "sv-SE", "fr-FR"],

  groups: [
    {
      language: "en",
      canonicalLocale: "en-US",
      members: ["en-*"],
      exclude: ["en-FR"], // France stays unique
    },
    {
      language: "sv",
      canonicalLocale: "sv-SE",
      members: ["sv-*"],
    },
    {
      language: "fr",
      canonicalLocale: "fr-FR",
      members: ["fr-*"],
    },
  ],
};

export const proxy = await createRouter(routing);`}
            />

            <span className="mt-9 inline-flex items-center gap-2.5 font-mono text-sm text-foreground">
              <span aria-hidden>→</span> the full blueprint
              <span className="text-dim">(URL from you)</span>
            </span>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-6 pb-16 pt-10">
        <div className="mx-auto flex max-w-[720px] items-center justify-between text-[13px] text-dim">
          <span>i18nsucks</span>
          <span>no analytics yet · © 2026 sannajammeh</span>
        </div>
      </footer>
    </>
  );
}
