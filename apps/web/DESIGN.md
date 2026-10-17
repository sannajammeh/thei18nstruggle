---
name: i18nsucks
description: A blunt, black-ground diagnosis of internationalization — minimal dark mode with one diagnostic red.
colors:
  void-black: "#0a0a0a"
  instrument-black: "#111111"
  hairline: "#232323"
  paper-white: "#e8e8e6"
  ash: "#8a8a86"
  ghost: "#55554f"
  diagnostic-red: "#ff4a3a"
  signal-green: "#3fbf6f"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(40px, 5.5vw, 64px)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(24px, 3vw, 32px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.14em"
    fontFeature: "uppercase via text-transform"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  section-y: "96px"
  hero-y: "112px 144px"
  measure: "720px"
components:
  button-primary:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.void-black}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    typography: "Geist 14px/600"
  button-primary-hover:
    backgroundColor: "#cfcecb"
    textColor: "{colors.void-black}"
  nav-link:
    textColor: "{colors.ash}"
    typography: "Geist 13px/400"
  exhibit-figure:
    backgroundColor: "{colors.instrument-black}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.lg}"
---

# Design System: i18nsucks

## Overview

**Creative North Star: "The Black Diagnosis"**

A near-black instrument report. The page is monochrome typography on void black; the only color is a single diagnostic red that marks what is broken, plus one signal green marking what works. Hierarchy comes from weight, size, and tone steps — never from color variation. Depth comes from darkness: fixed vignettes at the top and bottom make content dissolve into black as it enters and leaves the viewport, and a static header sits above the page with no border and no blur.

**Key Characteristics:**
- Monochrome ground with red reserved strictly for diagnosis and hover states
- Content emerges from and sinks back into black (fixed top/bottom vignettes)
- URL structures and crawl transcripts set as captioned exhibit panels — the memorable moment
- Geist for voice, Geist Mono for evidence (code, URLs, labels, captions)
- One authored motion moment: exhibit lines assemble on entry; otherwise still

## Colors

A grayscale instrument panel with one alarm color. White is assertion, ash is commentary, ghost is chrome, red is fault.

### Primary
- **Diagnostic Red** (#ff4a3a): section-number labels, broken-URL strikethroughs, ✗ transcript lines, "broken" status tags, hover states on links and outline buttons. Never on the headline "sucks." and never as a surface.

### Neutral
- **Void Black** (#0a0a0a): page ground.
- **Instrument Black** (#111111): exhibit panel fill.
- **Hairline** (#232323): section separators, panel borders, scrollbar thumb.
- **Paper White** (#e8e8e6): headlines, body, primary button fill, working URLs.
- **Ash** (#8a8a86): secondary text, argument prose, nav links, essential mono labels.
- **Ghost** (#55554f): faint chrome — inline code comments, dashed placeholder tags, hints that are deliberately quiet.
- **Signal Green** (#3fbf6f): ✓ lines and "proposed" status only — the fix, in one color.

### Named Rules
**The Diagnostic Red Rule.** Red appears only on small diagnostic marks and hover states. It never touches the headline "sucks.", never fills a surface, never exceeds a text-line's worth of pixels at rest.

**The Dissolve Rule.** The page's edges are black voids. Content near the top or bottom of the viewport fades toward `rgba(5,5,5,.9)` under fixed, non-interactive vignettes. New surfaces keep this immersion; never replace it with hard edges or opaque bars.

**The Monochrome Assertion Rule.** Emphasis is weight and tone, not hue. If a sentence needs red to matter, rewrite the sentence.

## Typography

**Display Font:** Geist (self-hosted via `next/font`; fallbacks ui-sans-serif, system-ui)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono (self-hosted via `next/font`)

**Character:** One family, two voices. Geist speaks; Geist Mono exhibits. The mono voice is reserved for evidence — code, URLs, transcripts, section labels, captions — never for prose.

### Hierarchy
- **Display** (700, clamp(40px, 5.5vw, 64px), 1.04): the hero only, two lines, left-aligned at the 720px measure.
- **Headline** (600, clamp(24px, 3vw, 32px), 1.15): section titles.
- **Body** (400, 17px, 1.6): argument prose, ash-toned, max-width 600px.
- **Label** (Geist Mono 400, 11–12px, 0.14–0.28em tracking, uppercase): kickers, section numbers, figure captions, statuses, hints.

### Named Rules
**The Mono-Is-Evidence Rule.** Geist Mono appears only where the page shows evidence or machine voice: code, URLs, transcripts, labels, captions. Prose never wears mono.

## Layout

Single centered column at a 720px measure with 24px side padding. Sections are full-width bands separated by 1px hairlines, with 96px vertical padding; the hero gets more (112px bottom, 144px top). Spacing rhythm is generous and even; more space above a heading than below. Below 640px: vignette heights shrink (160px/120px), type scales down via the clamps. Anchors scroll smoothly.

## Elevation & Depth

No shadows anywhere. The system is flat; depth is tonal (panel `#111111` on ground `#0a0a0a`, hairline borders) and atmospheric (the fixed vignettes). Any future shadow is a violation of the world unless the user pins a new one.

## Shapes

Rounded rectangles, small radii only: 8px on exhibit panels, 6px on buttons, 4px on the dashed placeholder tags. Hairline 1px borders in `#232323` delineate panels and sections. No hard offset shadows, no glass, no gradients except the vignette fades.

## Components

### Buttons
- **Shape:** 6px radius, no shadow.
- **Primary:** paper-white fill, void-black text, 12px 20px padding, 14px/600 Geist.
- **Hover:** dims to #cfcecb; the outline variant (1px hairline border, transparent fill) blushes diagnostic red on hover.

### Exhibit Figure (signature component)
- **Shape:** 8px radius panel, 1px hairline border, instrument-black fill, overflow hidden.
- **Caption bar:** 11px Geist Mono uppercase, 0.14em tracking, ash-toned; caption left, status right ("broken" in red, "proposed" in green).
- **Body:** 14px/2 Geist Mono lines; broken URLs struck through in red, ✗ lines red, ✓ lines green, commentary in ghost.
- **Motion:** lines rise 14px with exponential ease-out as they enter the viewport (scroll-driven, `cubic-bezier(0.16,1,0.3,1)`); reduced-motion and unsupported browsers see static lines.

### Navigation
- **Style:** static header, no border, no blur; bold wordmark with "sucks" dimmed to ash; no nav links.

### Inline Code (prose)
- **Style:** Geist Mono at 0.85em, foreground color, instrument-black fill, 1px hairline border, 4px radius, 1px 5px padding.
- **Use:** locale codes and technical terms inside argument prose (`en-SE`, `en-US`, `lang="en-FR"`). Never used for long code — long code belongs in exhibit figures.

## Do's and Don'ts

### Do:
- **Do** keep the ground at #0a0a0a and let vignettes dissolve content at both edges.
- **Do** set every URL, path, or transcript line in Geist Mono inside a captioned exhibit panel.
- **Do** use red only for diagnosis marks and interaction hovers; green only for the proposed fix.
- **Do** theme browser surfaces (selection white-on-black, red focus ring, hairline scrollbar) on every new surface.

### Don't:
- **Don't** put red on the headline "sucks." — explicit user rule, standing commitment.
- **Don't** add shadows, gradients (outside the vignettes), glass, or colored surfaces.
- **Don't** use mono for prose or give body text fewer than 4.5:1 contrast.
- **Don't** fill sections with card grids; the exhibit panel is the only container the world has.
