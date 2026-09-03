import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { getDb } from "@/server/db";
import { checkCollectRateLimit } from "@/server/services/rate-limit";
import { pageViews } from "../../../../drizzle/schema";

// No route segment config needed under Cache Components (cacheComponents:
// true, next.config.ts) — every route is dynamic by default, and this
// config now errors at build time if left in place.

const schema = z.object({
  path: z.string().min(1).max(512),
  ref: z.string().max(2048).optional(),
  utm: z
    .object({
      source: z.string().max(200).optional(),
      medium: z.string().max(200).optional(),
      campaign: z.string().max(200).optional(),
    })
    .optional(),
  screen: z.enum(["m", "t", "d"]).optional(),
});

const DEVICE = { m: "mobile", t: "tablet", d: "desktop" } as const;
const noContent = () => new NextResponse(null, { status: 204 });

/** Best-effort host extraction; returns null on same host or parse failure. */
function referrerHost(ref: string | undefined, selfHost: string | null) {
  if (!ref) return null;
  try {
    const h = new URL(ref).hostname;
    return h && h !== selfHost ? h : null;
  } catch {
    return null;
  }
}

function deviceFrom(screen: string | undefined, ua: string) {
  if (screen) return DEVICE[screen as keyof typeof DEVICE];
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return noContent();
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return noContent();

  const ip = clientIpFromHeaders(req.headers) ?? "unknown";
  if (!(await checkCollectRateLimit(ip))) return noContent();

  const ua = req.headers.get("user-agent") ?? "";
  const salt = env.IP_HASH_SALT ?? "dev-insecure-salt";
  const day = new Date().toISOString().slice(0, 10);
  // One-way, rotates daily → counts unique visitors without identifying them.
  const visitorHash = createHash("sha256")
    .update(`${ip}|${ua}|${day}|${salt}`)
    .digest("hex");

  const selfHost = (() => {
    try {
      return new URL(req.url).hostname;
    } catch {
      return null;
    }
  })();

  const { path, ref, utm, screen } = parsed.data;
  try {
    await getDb()
      .insert(pageViews)
      .values({
        path: path.split("?")[0]!.slice(0, 512),
        referrerHost: referrerHost(ref, selfHost),
        utmSource: utm?.source ?? null,
        utmMedium: utm?.medium ?? null,
        utmCampaign: utm?.campaign ?? null,
        country: req.headers.get("x-vercel-ip-country") ?? null,
        device: deviceFrom(screen, ua),
        visitorHash,
      });
  } catch {
    // analytics must never break the request path — swallow errors
  }
  return noContent();
}
