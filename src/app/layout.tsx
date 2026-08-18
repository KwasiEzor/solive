import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Solive — studio de développement",
    template: "%s · Solive",
  },
  description:
    "Studio de développement à Bruxelles : sites vitrines, applications web métier et applications mobiles.",
};

// Default palette (SLV-067); overridden by admin settings in Phase 5.
const DEFAULT_PALETTE = "t-chaux";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${DEFAULT_PALETTE} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
