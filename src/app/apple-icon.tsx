import { ImageResponse } from "next/og";

// iOS home-screen icon = the badge variant (mint field, ink S). Full-bleed so
// iOS can round it; kept within the maskable safe zone.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" width="104" height="104" viewBox="0 0 48 48" fill="none" stroke="#04140d" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"><path d="M33 13 H15 V24 H33 V35 H15"/><path d="M33 9.5 V16.5"/><path d="M15 31.5 V38.5"/></svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#34e4a1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={104}
          height={104}
          alt=""
          src={`data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`}
        />
      </div>
    ),
    { ...size },
  );
}
