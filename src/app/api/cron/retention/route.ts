import { and, lt, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/server/db";
import { leads, loginAttempts } from "../../../../../drizzle/schema";

// Data-retention job (SLV-124): anonymise old leads and prune technical logs,
// enforcing storage limitation (art. 5.1.e RGPD). Triggered by Vercel Cron;
// authenticated by CRON_SECRET (Vercel sends it as a Bearer token).
export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const ANON_EMAIL = "anonymise@solive.pro";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const now = Date.now();
  const attemptsCutoff = new Date(now - 90 * DAY); // 90 days
  const leadsCutoff = new Date(now - 1096 * DAY); // ~36 months

  const prunedAttempts = await db
    .delete(loginAttempts)
    .where(lt(loginAttempts.createdAt, attemptsCutoff))
    .returning({ id: loginAttempts.id });

  const anonymizedLeads = await db
    .update(leads)
    .set({
      name: "—",
      email: ANON_EMAIL,
      company: null,
      message: "[anonymisé — politique de rétention]",
      ipHash: null,
      userAgent: null,
    })
    .where(and(lt(leads.createdAt, leadsCutoff), ne(leads.email, ANON_EMAIL)))
    .returning({ id: leads.id });

  return NextResponse.json({
    ok: true,
    prunedLoginAttempts: prunedAttempts.length,
    anonymizedLeads: anonymizedLeads.length,
  });
}
