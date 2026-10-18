"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Edge = readonly [string, string];

/**
 * Rounded-corner "smoothstep" route, the way React Flow draws edges:
 * leave the source downward, bend, run across, bend, enter the target.
 */
function smoothstepPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius = 12,
): string {
  if (Math.abs(x2 - x1) < 0.5 || y2 - y1 < 1) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  const yMid = (y1 + y2) / 2;
  const dir = x2 > x1 ? 1 : -1;
  const r = Math.max(
    0,
    Math.min(
      radius,
      (y2 - y1) / 2,
      Math.abs(yMid - y1),
      Math.abs(y2 - yMid),
      Math.abs(x2 - x1) / 2,
    ),
  );
  const pt = (x: number, y: number) =>
    `${Math.round(x * 100) / 100} ${Math.round(y * 100) / 100}`;
  return [
    `M ${pt(x1, y1)}`,
    `L ${pt(x1, yMid - r)}`,
    `Q ${pt(x1, yMid)} ${pt(x1 + dir * r, yMid)}`,
    `L ${pt(x2 - dir * r, yMid)}`,
    `Q ${pt(x2, yMid)} ${pt(x2, yMid + r)}`,
    `L ${pt(x2, y2)}`,
  ].join(" ");
}

export function FlowDiagram({
  edges,
  children,
}: {
  edges: readonly Edge[];
  children: ReactNode;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [paths, setPaths] = useState<string[]>([]);

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base = canvas.getBoundingClientRect();
    if (base.width === 0) return;
    const nodes = new Map<string, DOMRect>();
    for (const el of canvas.querySelectorAll<HTMLElement>("[data-flow-node]")) {
      const id = el.dataset.flowNode;
      if (id) nodes.set(id, el.getBoundingClientRect());
    }
    const next: string[] = [];
    for (const [from, to] of edges) {
      const a = nodes.get(from);
      const b = nodes.get(to);
      if (!a || !b) continue;
      next.push(
        smoothstepPath(
          a.left + a.width / 2 - base.left,
          a.bottom - base.top,
          b.left + b.width / 2 - base.left,
          b.top - base.top,
        ),
      );
    }
    setPaths((prev) =>
      prev.length === next.length && prev.every((p, i) => p === next[i])
        ? prev
        : next,
    );
  }, [edges]);

  useEffect(() => {
    measure();
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    document.fonts.ready.then(() => measure());
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div className="flow-body">
      <div ref={canvasRef} className="flow-canvas">
        <svg aria-hidden className="flow-edges">
          <title>locale grouping connectors</title>
          {paths.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
        {children}
      </div>
    </div>
  );
}
