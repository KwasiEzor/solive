import { ImageResponse } from "next/og";

// Browser-tab favicon (PNG), generated from the brand mark so it never drifts.
export const size = { width: 48, height: 48 };
export const contentType = "image/png";

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="#34e4a1" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"><path d="M33 13 H15 V24 H33 V35 H15"/><path d="M33 9.5 V16.5"/><path d="M15 31.5 V38.5"/></svg>`;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0c10",
          borderRadius: "11px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={34}
          height={34}
          alt=""
          src={`data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`}
        />
      </div>
    ),
    { ...size },
  );
}
