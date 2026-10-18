"use client";

import { type ReactNode, useState } from "react";

export function FlowTabs({
  interactive,
  children,
}: {
  interactive: ReactNode;
  children: ReactNode;
}) {
  const [tab, setTab] = useState<"interactive" | "flow">("interactive");
  return (
    <div className="fi-tabs-wrap">
      <div className="fi-tabs">
        <button
          type="button"
          className={`fi-tab${tab === "interactive" ? " active" : ""}`}
          aria-pressed={tab === "interactive"}
          onClick={() => setTab("interactive")}
        >
          interactive
        </button>
        <button
          type="button"
          className={`fi-tab${tab === "flow" ? " active" : ""}`}
          aria-pressed={tab === "flow"}
          onClick={() => setTab("flow")}
        >
          full flowchart
        </button>
      </div>
      {tab === "interactive" ? interactive : children}
    </div>
  );
}
