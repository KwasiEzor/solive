// Reset an existing admin's password (the one-time bootstrap in seed:owner
// refuses to run twice). Uses the service role — never exposed to the client.
// Run:
//   OWNER_EMAIL=you@solive.be OWNER_PASSWORD='nouveau-mot-de-passe-12+' pnpm owner:password
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.OWNER_EMAIL;
const password = process.env.OWNER_PASSWORD;

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!url || !serviceKey)
  fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
if (!email) fail("OWNER_EMAIL is required.");
if (!password || password.length < 12)
  fail("OWNER_PASSWORD is required (≥ 12 chars).");

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: rows, error: qErr } = await admin
  .from("admin_users")
  .select("id, role")
  .eq("email", email)
  .is("disabled_at", null)
  .limit(1);
if (qErr) fail(`could not query admin_users: ${qErr.message}`);
if (!rows || rows.length === 0) fail(`no active admin with email ${email}`);

const { error: upErr } = await admin.auth.admin.updateUserById(rows[0].id, {
  password,
  email_confirm: true,
});
if (upErr) fail(`could not update password: ${upErr.message}`);

console.log(
  `✓ Mot de passe mis à jour pour ${email} (${rows[0].role}). ` +
    `Connexion : /connexion → enrôlement MFA au premier login.`,
);
