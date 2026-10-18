# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers who build or run multi-locale, multi-market websites — especially international e-commerce. They arrive while evaluating how to structure locales and markets, often after being burned by i18n complexity or by SEO problems across markets.

## Product Purpose

An opinionated single-topic site that explains how i18n — and especially international e-commerce — sucks, and documents the pitfalls of running multi-locale, multi-market websites. It diagnoses the problems (including how Google SEO handles locale/market structure) and argues for a specific solution: language-grouped markets. Success: a developer reads it, recognizes their own pain, and understands the proposed approach well enough to act on it.

## Positioning

A blunt, first-person critique in the "X sucks" genre (modeled on loggingsucks.com). Vendor docs and i18n-library marketing cannot truthfully copy this stance: they must sell i18n tooling; this site is free to say the practice itself is broken and to take a concrete architectural position (language-grouped markets) that neutral tutorials avoid.

## Operating Context

Read on the web, often shared developer-to-developer (links in threads, chats, newsletters). The planned content outline the author gave:

1. i18n Is Hard
2. The Problem
3. Google SEO
4. The solution: language grouped markets
5. Code example URL

## Capabilities and Constraints

- Single web app (`apps/web`) in a Turborepo monorepo; stack is fixed to what the repo already has: Next.js 16 (App Router), React 19, Tailwind CSS 4, Biome, bun.
- The author writes and populates all copy personally. Placeholder or invented final body copy must not ship as if it were the author's text.
- Explicitly undecided: custom domain/deploy target, analytics, whether additional pages beyond the main narrative will exist.

## Brand Commitments

- Name: **The i18n Struggle** (renamed from the earlier working title "i18nsucks"; the blunt register of the brand remains part of it).
- Genre reference the user made binding: loggingsucks.com — same family of single-topic, opinionated manifesto sites.
- Voice: blunt, opinionated, developer-to-developer.

## Evidence on Hand

None. There is no content, no data, no testimonials, no screenshots, and no benchmarks yet. Future work must not fabricate claims, metrics, customer stories, or quotes; the author supplies all text.

## Product Principles

1. **Say the blunt thing.** The critique itself is the product; hedged, vendor-neutral prose would betray the brand.
2. **Concrete over abstract.** Real pitfalls, real URL structures, code examples — arguments a developer can verify against their own site.
3. **One clear argument arc.** Problem → why SEO makes it worse → language-grouped markets as the fix; every surface serves that arc.
4. **Never fabricate.** The author owns the words; design frames them, it does not invent them.
