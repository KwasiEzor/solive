import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Ardoise (default) palette — kept in sync with src/styles/tokens.css.
const BG = "#0a0c10";
const FG = "#e9edf3";
const DIM = "rgba(233,237,243,0.72)";
const ACC = "#34e4a1";

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 18 18"><g stroke="${ACC}" stroke-width="1.7" stroke-linecap="round" fill="none"><path d="M2.5 3.5h13M2.5 14.5h13"/><path d="M9 3.5v11"/></g></svg>`;

/** Branded 1200×630 social card. `eyebrow` sits above the title. */
export function renderOg({
  title,
  eyebrow,
  footer = "Devis fixe · Calendrier daté · Code livré",
}: {
  title: string;
  eyebrow?: string;
  footer?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: FG,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={64}
            height={64}
            alt=""
            src={`data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`}
          />
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: 3 }}>
            SOLIVE
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {eyebrow && (
            <div style={{ fontSize: 26, color: ACC, fontWeight: 700 }}>
              {eyebrow.toUpperCase()}
            </div>
          )}
          <div
            style={{
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: -1,
              maxWidth: 960,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
          }}
        >
          <div style={{ color: ACC, fontWeight: 700 }}>solive.pro</div>
          <div style={{ color: DIM }}>{footer}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
