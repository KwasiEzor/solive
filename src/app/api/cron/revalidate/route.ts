import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// Maintenance endpoint: bust the content Data Cache after a direct DB write
// that bypassed the normal admin Server Actions (which call revalidateTag
// themselves on every mutation). Same Bearer-auth pattern as the retention
// cron — not a public route, not wired to any Vercel Cron schedule.
export const dynamic = "force-dynamic";

const KNOWN_TAGS = new Set([
  "content:settings",
  "content:sections",
  "content:services",
  "content:process_steps",
  "content:projects",
  "content:pricing_plans",
  "content:testimonials",
  "content:faq_items",
  "content:legal_pages",
]);

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { tag } = await req.json().catch(() => ({ tag: undefined }));
  if (typeof tag !== "string" || !KNOWN_TAGS.has(tag)) {
    return NextResponse.json(
      { error: "invalid tag", known: [...KNOWN_TAGS] },
      { status: 400 },
    );
  }

  revalidateTag(tag, "max");
  return NextResponse.json({ ok: true, tag });
}
