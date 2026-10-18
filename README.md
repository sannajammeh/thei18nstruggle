# The i18n struggle

An essay and a working counter-proposal for multi-locale SEO routing.
Search engines get one clean, non-duplicated set of indexable pages;
humans get geolocated into the right market (currency, prices, shipping)
before they ever see a URL.

## Structure

### apps/web
The article itself. A single Next.js page walking through the problem —
locale-prefixed duplicates competing with each other in search results —
and the fix: language-specific locale groups.

### apps/example
A runnable Next.js app wired to `@concept/router`. 17 locales grouped by
language (`en`, `sv`, `fr`, `de`), with unique markets (`en-AU`, `fr-CA`,
…) kept fully indexed and the rest canonicalized into their group's
canonical locale. Geolocation is forced and sourced from
`x-vercel-ip-country`; `i18n/markets.ts` holds the commercial layer
(currency per market) that Google never sees.

### packages/router
The concept. `@concept/router` is a locale-grouping router built as pure,
composable stages (`geolocate` → `negotiate` → `getOutcome` → `getResponse`)
over a serializable `Routing` config. Framework-agnostic core with a thin
Next.js adapter (`@concept/router/next`) exposing a one-line `proxy.ts`.
Details in [packages/router/README.md](packages/router/README.md).
