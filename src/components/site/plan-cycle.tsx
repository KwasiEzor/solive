"use client";
import { type CSSProperties, useEffect, useState } from "react";

function Cote({
  x1,
  x2,
  y,
  label,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
}) {
  return (
    <g className="f1" style={{ animationDelay: "1.3s" }}>
      <path className="pl-cote" d={`M${x1} ${y} H${x2}`} />
      <path className="pl-cote" d={`M${x1} ${y - 6} V${y + 6}`} />
      <path className="pl-cote" d={`M${x2} ${y - 6} V${y + 6}`} />
      <text className="pl-txt" x={(x1 + x2) / 2} y={y - 12} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function Annot({
  x,
  y,
  lx1,
  ly1,
  lx2,
  ly2,
  text,
  anchor = "end",
}: {
  x: number;
  y: number;
  lx1: number;
  ly1: number;
  lx2: number;
  ly2: number;
  text: string;
  anchor?: "start" | "end" | "middle";
}) {
  return (
    <g className="f1" style={{ animationDelay: "1.15s" }}>
      <path className="pl-cote" d={`M${lx1} ${ly1} L${lx2} ${ly2}`} />
      <circle className="pl-accent-dot" cx={lx2} cy={ly2} r="3" />
      <text className="pl-txt" x={x} y={y} textAnchor={anchor}>
        {text}
      </text>
    </g>
  );
}

const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

function PlanVitrine() {
  return (
    <g>
      <rect className="pl-line d1" x="70" y="46" width="420" height="286" rx="8" />
      <path className="pl-line d1" d="M70 78 H490" style={delay(0.25)} />
      <circle className="pl-dot f1" cx="88" cy="62" r="4" style={delay(0.4)} />
      <circle className="pl-dot f1" cx="102" cy="62" r="4" style={delay(0.45)} />
      <circle className="pl-dot f1" cx="116" cy="62" r="4" style={delay(0.5)} />
      <rect className="pl-solid f1" x="94" y="102" width="176" height="14" rx="3" style={delay(0.55)} />
      <rect className="pl-solid f1" x="94" y="124" width="220" height="9" rx="3" style={delay(0.62)} />
      <rect className="pl-solid f1" x="94" y="139" width="150" height="9" rx="3" style={delay(0.68)} />
      <rect className="pl-accent f1" x="94" y="164" width="96" height="26" rx="4" style={delay(0.76)} />
      <rect className="pl-line d1" x="316" y="102" width="150" height="88" rx="5" style={delay(0.8)} />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          className="pl-line d1"
          x={94 + i * 128}
          y="216"
          width="112"
          height="76"
          rx="5"
          style={delay(0.9 + i * 0.1)}
        />
      ))}
      <Cote x1={70} x2={490} y={356} label="page d'accueil — 1,2 s de chargement" />
      <Annot x={340} y={92} lx1={330} ly1={96} lx2={300} ly2={118} text="SEO technique" />
    </g>
  );
}

function PlanApp() {
  return (
    <g>
      <rect className="pl-line d1" x="70" y="46" width="420" height="286" rx="8" />
      <path className="pl-line d1" d="M162 46 V332" style={delay(0.22)} />
      <path className="pl-line d1" d="M162 84 H490" style={delay(0.3)} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          className="pl-solid f1"
          x="86"
          y={78 + i * 26}
          width={i === 0 ? 58 : 48}
          height="8"
          rx="3"
          style={delay(0.4 + i * 0.06)}
        />
      ))}
      <rect className="pl-accent f1" x="78" y="72" width="4" height="20" rx="2" style={delay(0.4)} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <path className="pl-line d1" d={`M180 ${120 + i * 34} H472`} style={delay(0.7 + i * 0.08)} />
          <rect className="pl-solid f1" x="180" y={104 + i * 34} width={120 - i * 14} height="8" rx="3" style={delay(0.75 + i * 0.08)} />
          <rect className="pl-solid f1" x="340" y={104 + i * 34} width="46" height="8" rx="3" style={delay(0.78 + i * 0.08)} />
        </g>
      ))}
      {[34, 58, 40, 72, 52].map((h, i) => (
        <rect
          key={i}
          className={i === 3 ? "pl-accent f1" : "pl-solid f1"}
          x={186 + i * 34}
          y={296 - h}
          width="20"
          height={h}
          rx="3"
          style={delay(1.05 + i * 0.07)}
        />
      ))}
      <Cote x1={70} x2={490} y={356} label="tableau de bord — vos règles métier" />
      <Annot x={370} y={92} lx1={362} ly1={96} lx2={330} ly2={112} text="comptes + rôles" />
    </g>
  );
}

function PlanMobile() {
  return (
    <g>
      <rect className="pl-line d1" x="316" y="70" width="132" height="248" rx="18" style={delay(0.3)} opacity="0.45" />
      <rect className="pl-line d1" x="196" y="46" width="150" height="286" rx="22" />
      <path className="pl-line d1" d="M244 60 H298" style={delay(0.3)} />
      <path className="pl-line d1" d="M196 96 H346" style={delay(0.36)} />
      <rect className="pl-solid f1" x="212" y="76" width="52" height="9" rx="3" style={delay(0.44)} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect className="pl-line d1" x="212" y={112 + i * 46} width="118" height="36" rx="6" style={delay(0.55 + i * 0.09)} />
          <rect className="pl-solid f1" x="224" y={124 + i * 46} width={70 - i * 8} height="7" rx="3" style={delay(0.62 + i * 0.09)} />
          <rect className={i === 1 ? "pl-accent f1" : "pl-solid f1"} x="224" y={136 + i * 46} width="44" height="6" rx="3" style={delay(0.66 + i * 0.09)} />
        </g>
      ))}
      <path className="pl-line d1" d="M196 300 H346" style={delay(1)} />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          className={i === 0 ? "pl-accent-dot f1" : "pl-dot f1"}
          cx={228 + i * 45}
          cy="316"
          r="5"
          style={delay(1.05 + i * 0.07)}
        />
      ))}
      <Cote x1={196} x2={448} y={356} label="iOS + Android — une seule base de code" />
      <Annot x={120} y={140} lx1={168} ly1={136} lx2={196} ly2={150} text="hors-ligne" anchor="start" />
    </g>
  );
}

const PLANS = [
  { key: "vitrine", label: "Site vitrine", el: <PlanVitrine /> },
  { key: "app", label: "Application web", el: <PlanApp /> },
  { key: "mobile", label: "Application mobile", el: <PlanMobile /> },
] as const;

export function PlanCycle() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((v) => (v + 1) % PLANS.length), 5200);
    return () => clearTimeout(t);
  }, [i, paused]);

  const plan = PLANS[i]!;
  return (
    <div className="plan-wrap">
      <div className="plan-head">
        <span className="mono tiny dim">
          PLAN {String(i + 1).padStart(2, "0")}/03
        </span>
        <div className="plan-tabs" role="tablist" aria-label="Type de projet">
          {PLANS.map((p, k) => (
            <button
              key={p.key}
              type="button"
              role="tab"
              aria-selected={k === i}
              className={"plan-tab" + (k === i ? " on" : "")}
              onClick={() => {
                setI(k);
                setPaused(true);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <svg
        viewBox="0 0 560 380"
        className="plan-svg"
        role="img"
        aria-label={`Schéma : ${plan.label}`}
      >
        <g key={plan.key}>{plan.el}</g>
      </svg>
    </div>
  );
}
