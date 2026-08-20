// Push the local .env.local secrets to the linked Vercel project (production).
// The values never leave your machine except to your own Vercel project.
// Run once (and after any secret change):  pnpm vercel:env
//
// Override the production URL if needed:  PROD_SITE_URL=https://solive.pro pnpm vercel:env
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

// KV_* are already provisioned by the Upstash marketplace integration.
const KEYS = [
  "SUPABASE_DB_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "BREVO_API_KEY",
  "EMAIL_FROM",
  "EMAIL_TO",
  "IP_HASH_SALT",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "NEXT_PUBLIC_SENTRY_DSN",
];

const raw = readFileSync(".env.local", "utf8");
const local = {};
for (const line of raw.split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (!m) continue;
  let v = m[2];
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  local[m[1]] = v;
}

const toPush = {
  // Current production URL. Switch to https://solive.pro once that domain is
  // attached in Vercel (Settings → Domains), or override with PROD_SITE_URL.
  NEXT_PUBLIC_SITE_URL: process.env.PROD_SITE_URL || "https://solive.vercel.app",
  CRON_SECRET: local.CRON_SECRET || randomBytes(24).toString("hex"),
};
for (const k of KEYS) if (local[k]) toPush[k] = local[k];

for (const [k, v] of Object.entries(toPush)) {
  try {
    execFileSync("vercel", ["env", "rm", k, "production", "-y"], {
      stdio: "ignore",
    });
  } catch {
    /* not set yet — fine */
  }
  execFileSync("vercel", ["env", "add", k, "production"], {
    input: v,
    stdio: ["pipe", "ignore", "inherit"],
  });
  console.log(`✓ ${k}`);
}

console.log(
  `\nDone. ${Object.keys(toPush).length} vars pushed to production.` +
    `\nCRON_SECRET = ${toPush.CRON_SECRET}` +
    `\nNEXT_PUBLIC_SITE_URL = ${toPush.NEXT_PUBLIC_SITE_URL}` +
    `\nNext: pnpm vercel:deploy`,
);
