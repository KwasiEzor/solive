// One-time owner bootstrap (SLV-001). No public signup — the first admin is
// created here, exactly once. Run:
//   OWNER_EMAIL=you@solive.be OWNER_PASSWORD='min 12 chars' pnpm seed:owner
// MFA is enrolled on first login (SLV-041). Idempotent: refuses if an owner
// already exists.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.OWNER_EMAIL;
const password = process.env.OWNER_PASSWORD;
const fullName = process.env.OWNER_NAME ?? null;

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!url || !serviceKey) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
if (!email) fail("OWNER_EMAIL is required.");
if (!password || password.length < 12) fail("OWNER_PASSWORD is required (≥ 12 chars).");

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Refuse if an owner already exists (SLV-070 — never leave zero owners, and
// don't silently create a second bootstrap owner).
const { data: existing, error: exErr } = await admin
  .from("admin_users")
  .select("id")
  .eq("role", "owner")
  .is("disabled_at", null)
  .limit(1);
if (exErr) fail(`could not query admin_users: ${exErr.message}`);
if (existing && existing.length > 0) fail("An owner already exists — bootstrap is one-time.");

const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (createErr) fail(`could not create auth user: ${createErr.message}`);

const userId = created.user.id;
const { error: rowErr } = await admin.from("admin_users").insert({
  id: userId,
  email,
  full_name: fullName,
  role: "owner",
});
if (rowErr) {
  // roll back the auth user so a retry is clean
  await admin.auth.admin.deleteUser(userId);
  fail(`could not insert admin_users row: ${rowErr.message}`);
}

console.log(`✓ Owner created: ${email} (${userId}). Enroll MFA on first login.`);
