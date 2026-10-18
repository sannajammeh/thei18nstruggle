"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Chip = { locale: "en-US" | "en-NO"; product: "pen" | "fine-liner" };

const CHIPS: readonly Chip[] = [
  { locale: "en-US", product: "pen" },
  { locale: "en-US", product: "fine-liner" },
  { locale: "en-NO", product: "pen" },
  { locale: "en-NO", product: "fine-liner" },
];

/** Stage at which each node turns on. */
const APPEAR: Record<string, number> = {
  req: 0,
  geo: 1,
  bot: 2,
  "user-0": 3,
  "google-0": 3,
  "user-1": 4,
  "google-1": 4,
  hreflangs: 5,
};

/** Camera focus order — pipeline nodes collapse once focus moves past them. */
const FOCUS: readonly string[] = [
  "req",
  "geo",
  "bot",
  "user-0",
  "user-1",
  "hreflangs",
];

/** Nodes that never collapse — the outcomes are the punchline. */
const KEEP: readonly string[] = [
  "user-0",
  "user-1",
  "google-0",
  "google-1",
  "hreflangs",
];

const EDGES: readonly { from: string; to: string; stage: number }[] = [
  { from: "req", to: "geo", stage: 1 },
  { from: "geo", to: "bot", stage: 2 },
  { from: "bot", to: "user-0", stage: 3 },
  { from: "bot", to: "google-0", stage: 3 },
  { from: "user-0", to: "user-1", stage: 4 },
  { from: "google-0", to: "google-1", stage: 4 },
  { from: "google-1", to: "hreflangs", stage: 5 },
];

/** Per-stage dwell before the camera advances (index = current stage). */
const STEP_MS = [900, 1150, 1150, 1200, 1100];

/**
 * Horizontal "smoothstep" route, the way React Flow draws edges:
 * leave the source to the right, bend, run vertically, bend, enter the target.
 */
function smoothstepH(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius = 12,
): string {
  if (Math.abs(y2 - y1) < 0.5 || x2 - x1 < 1) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  const xMid = (x1 + x2) / 2;
  const dir = y2 > y1 ? 1 : -1;
  const r = Math.max(
    0,
    Math.min(
      radius,
      (x2 - x1) / 2,
      Math.abs(xMid - x1),
      Math.abs(x2 - xMid),
      Math.abs(y2 - y1) / 2,
    ),
  );
  const pt = (x: number, y: number) =>
    `${Math.round(x * 100) / 100} ${Math.round(y * 100) / 100}`;
  return [
    `M ${pt(x1, y1)}`,
    `L ${pt(xMid - r, y1)}`,
    `Q ${pt(xMid, y1)} ${pt(xMid, y1 + dir * r)}`,
    `L ${pt(xMid, y2 - dir * r)}`,
    `Q ${pt(xMid, y2)} ${pt(xMid + r, y2)}`,
    `L ${pt(x2, y2)}`,
  ].join(" ");
}

/** offsetLeft/Top of `el` relative to `ancestor`, unaffected by transforms. */
function offsetWithin(
  el: HTMLElement,
  ancestor: HTMLElement,
): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let cur: HTMLElement | null = el;
  while (cur && cur !== ancestor) {
    x += cur.offsetLeft;
    y += cur.offsetTop;
    cur = cur.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

function FiNode({
  id,
  label,
  stage,
  chip,
  tone,
  children,
}: {
  id: string;
  label: string;
  stage: number;
  chip: Chip | null;
  tone?: "blue";
  children: ReactNode;
}) {
  const appear = APPEAR[id] ?? 0;
  const focusIndex = FOCUS.indexOf(id);
  const on = stage >= appear;
  const focused = chip !== null && focusIndex >= 0 && stage === focusIndex;
  const past = focusIndex >= 0 && stage > focusIndex && !KEEP.includes(id);
  return (
    <div
      data-fi-node={id}
      className={`fi-node${on ? " on" : ""}${focused ? " focus" : ""}${past ? " past" : ""}${tone ? ` ${tone}` : ""}`}
    >
      <span className="fi-label">{label}</span>
      <span className="fi-body">
        <span className="fi-body-in">{children}</span>
      </span>
    </div>
  );
}

export function FlowInteractive() {
  const [chip, setChip] = useState<Chip | null>(null);
  const [stage, setStage] = useState(0);
  const [manual, setManual] = useState(false);
  const [paths, setPaths] = useState<{ d: string; on: boolean }[]>([]);
  const [camera, setCamera] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const nodes = new Map<string, HTMLElement>();
    for (const el of track.querySelectorAll<HTMLElement>("[data-fi-node]")) {
      const id = el.dataset.fiNode;
      if (id) nodes.set(id, el);
    }
    const box = (id: string) => {
      const el = nodes.get(id);
      if (!el) return null;
      const { x, y } = offsetWithin(el, track);
      return { left: x, top: y, w: el.offsetWidth, h: el.offsetHeight };
    };
    const next: { d: string; on: boolean }[] = [];
    for (const edge of EDGES) {
      const a = box(edge.from);
      const b = box(edge.to);
      if (!a || !b) continue;
      next.push({
        d: smoothstepH(a.left + a.w, a.top + a.h / 2, b.left, b.top + b.h / 2),
        on: stage >= edge.stage,
      });
    }
    setPaths((prev) =>
      prev.length === next.length &&
      prev.every((p, i) => p.d === next[i].d && p.on === next[i].on)
        ? prev
        : next,
    );

    const focusBox = box(FOCUS[stage]);
    if (focusBox) {
      const cs = getComputedStyle(viewport);
      const padL = Number.parseFloat(cs.paddingLeft) || 0;
      const padR = Number.parseFloat(cs.paddingRight) || 0;
      const vw = viewport.clientWidth - padL - padR;
      const tw = track.scrollWidth;
      const desired = vw / 2 - (focusBox.left + focusBox.w / 2);
      const min = Math.min(0, vw - tw);
      const tx = Math.max(min, Math.min(0, desired));
      setCamera((prev) => (Math.abs(prev - tx) < 0.5 ? prev : tx));
    }
  }, [stage]);

  // autoplay: advance the camera until the last stage (until the user takes over)
  useEffect(() => {
    if (!chip || manual || stage >= STEP_MS.length) return;
    const timer = setTimeout(() => setStage((s) => s + 1), STEP_MS[stage]);
    return () => clearTimeout(timer);
  }, [chip, manual, stage]);

  useEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(track);
    observer.observe(viewport);
    document.fonts.ready.then(() => measure());
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div className="fi">
      <div className="fi-chips">
        {CHIPS.map((c) => {
          const active =
            chip !== null &&
            chip.locale === c.locale &&
            chip.product === c.product;
          return (
            <button
              key={`${c.locale}/${c.product}`}
              type="button"
              className={`fi-chip${active ? " active" : ""}`}
              onClick={() => {
                setChip(c);
                setStage(0);
                setManual(false);
              }}
            >
              {c.locale}
              <span className="fi-chip-path">/{c.product}</span>
            </button>
          );
        })}
      </div>

      <div className="fi-viewport" ref={viewportRef}>
        <div
          className="fi-track"
          ref={trackRef}
          style={{ transform: `translate3d(${camera}px, 0, 0)` }}
        >
          <svg aria-hidden className="fi-edges">
            <title>request flow connectors</title>
            {paths.map((p) => (
              <path
                key={p.d}
                d={p.d}
                className={`fi-edge${p.on ? " on" : ""}`}
              />
            ))}
          </svg>

          <FiNode id="req" label="requested" stage={stage} chip={chip}>
            {chip ? (
              <>
                {chip.locale}
                <span className="fi-dim">/{chip.product}</span>
              </>
            ) : (
              <span className="fi-dim">awaiting navigation</span>
            )}
          </FiNode>

          <FiNode id="geo" label="Vercel GeoIP" stage={stage} chip={chip}>
            language: nb · country: NO
          </FiNode>

          <FiNode id="bot" label="middleware" stage={stage} chip={chip}>
            isBot()
          </FiNode>

          <div className="fi-branch">
            <div className="fi-lane">
              <span className={`fi-tag${stage >= 3 ? " on" : ""}`}>user</span>
              <div className="fi-row">
                <FiNode
                  id="user-0"
                  label="response"
                  stage={stage}
                  chip={chip}
                  tone={chip?.locale === "en-US" ? "blue" : undefined}
                >
                  {chip?.locale === "en-US" ? (
                    <>
                      307 <span className="fi-dim">→</span> /en-NO
                    </>
                  ) : (
                    <span className="fi-ok">stays · already en-NO</span>
                  )}
                </FiNode>
                <FiNode
                  id="user-1"
                  label="product card"
                  stage={stage}
                  chip={chip}
                >
                  {chip?.product === "pen"
                    ? "pen · 99 NOK"
                    : "fine-liner · 99 NOK"}
                </FiNode>
              </div>
            </div>
            <div className="fi-lane tag-below">
              <span className={`fi-tag${stage >= 3 ? " on" : ""}`}>google</span>
              <div className="fi-row">
                <FiNode
                  id="google-0"
                  label="response"
                  stage={stage}
                  chip={chip}
                >
                  <span className="fi-ok">200 · stays</span>
                </FiNode>
                <FiNode
                  id="google-1"
                  label="product card"
                  stage={stage}
                  chip={chip}
                >
                  {chip?.product === "pen"
                    ? "pen · $9.99"
                    : "fine-liner · $9.99"}
                </FiNode>
                <FiNode id="hreflangs" label="head" stage={stage} chip={chip}>
                  <span className="fi-dim">
                    en-US · sv-SE · fr-FR · en-AU · fr-CA
                  </span>
                </FiNode>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fi-foot">
        <button
          type="button"
          className="fi-nav"
          aria-label="previous step"
          disabled={chip === null || stage === 0}
          onClick={() => {
            setManual(true);
            setStage((s) => Math.max(0, s - 1));
          }}
        >
          ‹
        </button>
        <button
          type="button"
          className="fi-nav"
          aria-label="next step"
          disabled={chip === null || stage >= STEP_MS.length}
          onClick={() => {
            setManual(true);
            setStage((s) => Math.min(STEP_MS.length, s + 1));
          }}
        >
          ›
        </button>
        <button
          type="button"
          className="fi-replay"
          onClick={() => {
            setStage(0);
            setManual(false);
          }}
          disabled={chip === null}
        >
          ↻ replay
        </button>
      </div>
    </div>
  );
}
