import Image from "next/image";
import type { ReactNode } from "react";
import { useId } from "react";
import { highlight } from "sugar-high";
import { FlowDiagram } from "./flow-diagram";

function Dek({ children }: { children: ReactNode }) {
  return (
    <p className="dek mt-6 max-w-[600px] text-[17px] leading-[1.6] text-dim">
      {children}
    </p>
  );
}

function Quote({ children }: { children: ReactNode }) {
  return <blockquote className="quote">{children}</blockquote>;
}

function Figure({
  caption,
  status,
  tone,
  code,
  variant,
  children,
}: {
  caption: string;
  status?: string;
  tone?: "bad" | "ok";
  code?: string;
  variant?: "serp" | "flow";
  children?: ReactNode;
}) {
  return (
    <figure className="mt-11 overflow-hidden rounded-lg border border-line bg-panel">
      <figcaption className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
        <span>{caption}</span>
        {status ? (
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
        ) : null}
      </figcaption>
      {code !== undefined ? (
        <pre
          className="overflow-x-auto p-4 font-mono text-sm leading-[2]"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: self-authored, syntax-highlighted code samples
          dangerouslySetInnerHTML={{
            __html: highlight(code, { lang: "typescript" }).replace(/\n/g, ""),
          }}
        />
      ) : variant === "flow" ? (
        children
      ) : variant === "serp" ? (
        <div className="serp-body">{children}</div>
      ) : (
        <pre className="overflow-x-auto p-4 font-mono text-sm leading-[2]">
          {children}
        </pre>
      )}
    </figure>
  );
}

function FlowBox({
  id,
  head,
  children,
}: {
  id?: string;
  head?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flow-box" data-flow-node={id}>
      {head ? <span className="flow-head">{head}</span> : null}
      {children}
    </div>
  );
}

const flowEdges = [
  ["config", "grouped"],
  ["grouped", "en"],
  ["grouped", "sv"],
  ["grouped", "fr"],
  ["en", "en-members"],
  ["en-members", "en-au"],
  ["en-au", "google"],
  ["sv", "sv-members"],
  ["sv-members", "google"],
  ["fr", "fr-members"],
  ["fr-members", "fr-ca"],
  ["fr-ca", "google"],
] as const;

function SerpSearch({ query }: { query: string }) {
  return (
    <div className="serp-search">
      <svg
        aria-hidden
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <title>Search</title>
        <circle cx="7" cy="7" r="4.75" />
        <path d="M10.5 10.5L14 14" strokeLinecap="round" />
      </svg>
      {query}
    </div>
  );
}

function SerpResult({
  site,
  path,
  title,
  snippet,
  note,
  indent,
}: {
  site: string;
  path?: string;
  title: string;
  snippet: string;
  note?: string;
  indent?: boolean;
}) {
  return (
    <div className={indent ? "serp-result serp-indent" : "serp-result"}>
      <div className="serp-crumbs">
        <span aria-hidden className="serp-fav">
          e
        </span>
        <span className="serp-domain">{site}</span>
        {path ? (
          <>
            <span aria-hidden className="serp-sep">
              ›
            </span>
            <span>{path}</span>
          </>
        ) : null}
        {note ? <span className="serp-note">{note}</span> : null}
      </div>
      <div className="serp-title">{title}</div>
      <div className="serp-snippet">{snippet}</div>
    </div>
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
  title?: string;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-line px-6 py-24">
      <div className="mx-auto max-w-[720px]">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
          {num}
        </p>
        {title ? (
          <h2 className="mt-4 text-[clamp(24px,3vw,32px)] font-semibold leading-[1.15] tracking-[-0.02em]">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  const topId = useId();
  const introId = useId();
  const problemId = useId();
  const brokenId = useId();
  const fixId = useId();
  const codeId = useId();

  return (
    <>
      <div aria-hidden className="vig vig-top" />
      <div aria-hidden className="vig vig-bottom" />

      <main id={topId}>
        {/* hero */}
        <section className="px-6 pb-28 pt-36">
          <div className="mx-auto max-w-[720px]">
            <h1 className="mt-5 text-[clamp(40px,5.5vw,64px)] font-bold leading-[1.04] tracking-[-0.025em]">
              The i18n <span className="text-accent">Struggle</span>
            </h1>
            <Dek>And here&rsquo;s how to make it better.</Dek>
            <p className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-dim">
              <Image
                src="/avatar.jpg"
                alt=""
                width={28}
                height={28}
                className="rounded-full"
                priority
              />
              By Sanna Jammeh
            </p>
          </div>
        </section>

        {/* 01 — the geo popup */}
        <Section id={introId} num="01">
          <Dek>
            Your site competes with itself, and it&rsquo;s not your fault.
            Multi-lingual and multi-market sites are notoriously difficult to
            get right on the SEO side. Have you ever wondered why you sometimes
            get a &ldquo;We see that you&rsquo;re browsing from{" "}
            <code>{"<country>"}</code>&rdquo; popup on ecommerce sites? Me too
            &mdash; I&rsquo;ve implemented several of them. They exist to solve
            a problem:
          </Dek>
          <Quote>
            My user has navigated to an American site, but they&rsquo;re in
            Norway, how do I get them back?
          </Quote>
          <Dek>
            But this is only a symptom of a deeper problem; why are they on an
            American version of the site in the first place?
          </Dek>
        </Section>

        {/* 02 — the core problem */}
        <Section
          id={problemId}
          num="02 — the core problem"
          title="Your pages compete with themselves."
        >
          <Dek>
            The industry has settled on leveraging BCP-47 locales to separate
            languages and markets. This all makes sense, until content starts
            looking a bit too similar.
          </Dek>
          <Dek>
            Picture this: you sell the same products to Norway in NOK, the
            United States in USD, France in EUR, and Germany in EUR &mdash; and
            for all of these you support English and the region&rsquo;s native
            language.
          </Dek>
        </Section>

        {/* 03 — why the results are broken */}
        <Section
          id={brokenId}
          num="03 — the fallout"
          title="Why the results are broken."
        >
          <Dek>
            Picture a searcher in the default market &mdash; <code>en-US</code>.
            The query should belong to the root. Instead, the results page
            answers with locale-prefixed duplicates:
          </Dek>
          <Figure caption="Exhibit — the search results page" variant="serp">
            <SerpSearch query="coats" />
            <SerpResult
              site="example.com"
              title="Home"
              snippet="Coats and outerwear, shipped to your market."
            />
            <SerpResult
              site="example.com"
              path="en-no › coats"
              title="Coats"
              snippet="Coats — outerwear for every season."
              note="higher PA"
              indent
            />
            <SerpResult
              site="example.com"
              path="en-de"
              title="Home"
              snippet="Coats and outerwear, shipped to your market."
              note="higher PA, outcompetes Jackets"
              indent
            />
            <SerpResult
              site="example.com"
              path="jackets"
              title="Jackets"
              snippet="Jackets — layers for every climate."
              indent
            />
          </Figure>
          <Dek>
            When Google sees similar content, alternate hrefs become invalid.
            Google begins showing results sorted on Page Authority rather than
            region authority. The result is a search results page that &mdash;
            yes &mdash; shows the correctly ranked pages, but shows them with
            completely different locale prefixes, causing users to navigate to
            the wrong place.
          </Dek>
        </Section>

        {/* 04 — the fix */}
        <Section
          id={fixId}
          num="04 — the fix"
          title="Language-specific locale groups."
        >
          <Dek>
            If pages are identical between <code>en-NO</code> and{" "}
            <code>en-SE</code>, the ideal path is to only index a single
            variation of them in Google. This may seem counterintuitive:
          </Dek>
          <Quote>
            How will our users see different prices for their respective
            products?
          </Quote>
          <Dek>
            The answer to that is simple: Google uses more data than pages to
            show accurate product suggestions &mdash; JSON-LD, Merchant feeds,
            and so on.
          </Dek>
          <Dek>
            The users themselves will be forced into the correct respective
            locale by performing geolocation upon entering the site. Google, on
            the other hand, is not.
          </Dek>
          <Figure
            caption="Exhibit — how the grouping flows"
            status="the fix"
            tone="ok"
            variant="flow"
          >
            <FlowDiagram edges={flowEdges}>
              <FlowBox id="config" head="routing config">
                <span className="flow-sub">
                  every locale declared — nothing hidden
                </span>
              </FlowBox>
              <FlowBox id="grouped" head="grouped by language">
                <span className="flow-sub">
                  content-identical markets collapse
                </span>
              </FlowBox>
              <div className="flow-branch">
                <div className="flow-col">
                  <FlowBox id="en" head="en">
                    <span className="flow-sub">canonical · en-US (root)</span>
                  </FlowBox>
                  <FlowBox id="en-members">
                    <span className="flow-line">
                      <span className="no">en-GB ✗</span>
                    </span>
                    <span className="flow-line">
                      <span className="no">en-SE ✗</span>
                    </span>
                    <span className="flow-line">
                      <span className="no">en-NO ✗</span>
                    </span>
                    <span className="flow-sub">
                      noindex · canonical → en-US
                    </span>
                  </FlowBox>
                  <FlowBox id="en-au">
                    <span className="flow-line">
                      <span className="ok">en-AU ✓</span>
                    </span>
                    <span className="flow-sub">unique · fully indexed</span>
                  </FlowBox>
                </div>
                <div className="flow-col">
                  <FlowBox id="sv" head="sv">
                    <span className="flow-sub">canonical · sv-SE</span>
                  </FlowBox>
                  <FlowBox id="sv-members">
                    <span className="flow-line">
                      <span className="no">sv-NO ✗</span>
                    </span>
                    <span className="flow-line">
                      <span className="no">sv-FI ✗</span>
                    </span>
                    <span className="flow-sub">
                      noindex · canonical → sv-SE
                    </span>
                  </FlowBox>
                </div>
                <div className="flow-col">
                  <FlowBox id="fr" head="fr">
                    <span className="flow-sub">canonical · fr-FR</span>
                  </FlowBox>
                  <FlowBox id="fr-members">
                    <span className="flow-line">
                      <span className="no">fr-BE ✗</span>
                    </span>
                    <span className="flow-sub">
                      noindex · canonical → fr-FR
                    </span>
                  </FlowBox>
                  <FlowBox id="fr-ca">
                    <span className="flow-line">
                      <span className="ok">fr-CA ✓</span>
                    </span>
                    <span className="flow-sub">unique · fully indexed</span>
                  </FlowBox>
                </div>
              </div>
              <FlowBox id="google" head="what google sees">
                <span className="flow-sub ok">
                  example.com ✓ · /sv-SE ✓ · /fr-FR ✓ · /en-AU ✓ · /fr-CA ✓
                </span>
                <span className="flow-sub">
                  humans → geolocated into their market · google → never
                </span>
              </FlowBox>
            </FlowDiagram>
          </Figure>
        </Section>

        {/* close */}
        <section id={codeId} className="border-t border-line px-6 pb-20 pt-28">
          <div className="mx-auto max-w-[720px]">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
              05 — code example
            </p>
            <h2 className="mt-4 text-[clamp(24px,3vw,32px)] font-semibold leading-[1.15] tracking-[-0.02em]">
              Steal the structure.
            </h2>
            <Dek>Code example of the routing config.</Dek>

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

            <a
              href="https://github.com/sannajammeh/thei18nstruggle/tree/main/apps/example"
              className="mt-9 inline-flex items-center gap-2.5 font-mono text-sm text-foreground"
            >
              <span aria-hidden>→</span> the full blueprint
              <span className="text-dim">github.com/sannajammeh/thei18nstruggle/apps/example</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-6 pb-16 pt-10">
        <div className="mx-auto flex max-w-[720px] items-center justify-between text-[13px] text-dim">
          <span>the i18n struggle</span>
          <span>no analytics yet · © 2026 sannajammeh</span>
        </div>
      </footer>
    </>
  );
}
