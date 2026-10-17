import {
  canonicalLocale,
  getHtmlLang,
  hreflangAlternates,
  isConsolidated,
  isIndexable,
  type Locale,
  localeGroup,
  localePath,
  resolveCookies,
} from "@concept/router";
import {
  cookies as readCookieStore,
  headers as readHeaders,
} from "next/headers";
import { routing } from "@/i18n/config";
import { marketCurrency } from "@/i18n/markets";

export interface ExhibitLabels {
  visitor: string;
  live: string;
  url: string;
  served: string;
  market: string;
  preference: string;
  geo: string;
  lang: string;
  forced: string;
  none: string;
  googlebot: string;
  indexable: string;
  consolidated: string;
  canonical: string;
  group: string;
  origin: string;
  hreflang: string;
  bareLangNote: string;
}

const LABEL_WIDTH = 12;

type LineKind = "ok" | "no" | "bad" | "muted" | "plain";

function Line({
  kind = "plain",
  label,
  value,
  note,
}: {
  kind?: LineKind;
  label?: string;
  value: string;
  note?: string;
}) {
  const cls =
    kind === "ok"
      ? "ex ok"
      : kind === "no"
        ? "ex no"
        : kind === "bad"
          ? "ex ex-bad"
          : kind === "muted"
            ? "ex muted"
            : "ex";

  return (
    <span className={cls}>
      {label !== undefined && (
        <span className="cm">{label.padEnd(LABEL_WIDTH, " ")}</span>
      )}
      {value}
      {note ? <span className="cm">{`  // ${note}`}</span> : null}
    </span>
  );
}

function Exhibit({
  caption,
  status,
  tone,
  children,
}: {
  caption: string;
  status: string;
  tone?: "ok" | "bad";
  children: React.ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-lg border border-line bg-panel">
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
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-[2]">
        {children}
      </pre>
    </figure>
  );
}

export function SeoExhibitFallback({ labels }: { labels: ExhibitLabels }) {
  return (
    <div className="flex flex-col gap-6">
      <Exhibit caption={labels.visitor} status={labels.live} tone="ok">
        <Line label={labels.url} value={labels.none} />
        <Line label={labels.served} value={labels.none} />
        <Line label={labels.market} value={labels.none} />
        <Line label={labels.preference} value={labels.none} />
        <Line label={labels.geo} value={labels.none} />
        <Line label={labels.lang} value={labels.none} />
      </Exhibit>
      <Exhibit caption={labels.googlebot} status={labels.indexable} tone="ok">
        <Line label={labels.canonical} value={labels.none} />
        <Line label={labels.group} value={labels.none} />
        <Line label={labels.origin} value={labels.none} />
        <Line label={labels.hreflang} value={labels.none} />
        <Line label="" value={labels.none} />
        <Line label="" value={labels.none} />
        <Line label="" value={labels.none} />
        <Line label="" value={labels.none} />
      </Exhibit>
    </div>
  );
}

export async function SeoExhibit({
  locale,
  labels,
}: {
  locale: Locale;
  labels: ExhibitLabels;
}) {
  const [cookieStore, headerStore] = await Promise.all([
    readCookieStore(),
    readHeaders(),
  ]);

  const cookieNames = resolveCookies(routing);
  const preference = cookieStore.get(cookieNames.locale)?.value;
  const geo = headerStore.get("x-vercel-ip-country");

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host ?? "localhost:3000"}`;

  const canonical = canonicalLocale(routing, locale);
  const consolidated = isConsolidated(routing, locale);
  const indexable = isIndexable(routing, locale);
  const group = localeGroup(routing, locale);
  const htmlLang = getHtmlLang(locale, routing);
  const relative = (href: string) =>
    href.startsWith(origin) ? href.slice(origin.length) : href;

  return (
    <div className="flex flex-col gap-6">
      <Exhibit caption={labels.visitor} status={labels.live} tone="ok">
        <Line label={labels.url} value={localePath("/", locale, routing)} />
        <Line label={labels.served} value={locale} />
        <Line label={labels.market} value={marketCurrency[locale]} />
        <Line label={labels.preference} value={preference ?? labels.none} />
        {preference && preference !== locale && (
          <Line
            kind="no"
            label={labels.forced}
            value={`${preference} → ${locale}`}
          />
        )}
        <Line label={labels.geo} value={geo ?? labels.none} />
        <Line
          label={labels.lang}
          value={htmlLang}
          note={htmlLang !== locale ? labels.bareLangNote : undefined}
        />
      </Exhibit>

      <Exhibit
        caption={labels.googlebot}
        status={indexable ? labels.indexable : labels.consolidated}
        tone={indexable ? "ok" : "bad"}
      >
        <Line
          kind={consolidated ? "bad" : "ok"}
          label={labels.canonical}
          value={consolidated ? locale : canonical}
        />
        {consolidated && <Line kind="ok" value={`→ ${canonical}`} />}
        <Line
          label={labels.group}
          value={
            group
              ? group.members
                  .map((member) =>
                    member === group.canonicalLocale ? `${member}*` : member,
                  )
                  .join(" · ")
              : labels.none
          }
        />
        <Line label={labels.origin} value={origin} />
        {hreflangAlternates(routing, origin).map((alternate, index) => (
          <Line
            key={alternate.hreflang}
            label={index === 0 ? labels.hreflang : ""}
            kind={alternate.hreflang === "x-default" ? "muted" : "plain"}
            value={`${alternate.hreflang}  →  ${relative(alternate.href)}`}
          />
        ))}
      </Exhibit>
    </div>
  );
}
