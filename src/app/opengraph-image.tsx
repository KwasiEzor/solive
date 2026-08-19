import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Solive — studio de développement à Bruxelles";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({
    eyebrow: "Studio de développement — Bruxelles",
    title: "Des sites et des applications qui tiennent debout.",
  });
}
