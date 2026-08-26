"use server";
import { cookies } from "next/headers";
import { isPalette, PALETTE_COOKIE } from "@/lib/palette";

/**
 * Per-visitor palette override (no auth — anyone browsing the public site can
 * set their own preference). Site-wide default stays admin-controlled via
 * site_settings.activePalette; this cookie only overrides it for this visitor.
 */
export async function setPaletteAction(palette: string): Promise<void> {
  if (!isPalette(palette)) return;
  const store = await cookies();
  store.set(PALETTE_COOKIE, palette, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
