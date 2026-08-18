import { err, ok, type Result } from "@/lib/result";

/**
 * HaveIBeenPwned breach check via k-anonymity (SLV-040): only the first 5 chars
 * of the SHA-1 hash are ever sent; the full password never leaves the server.
 */
const RANGE_URL = "https://api.pwnedpasswords.com/range/";

async function sha1Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Returns ok(true) if the password appears in a known breach, ok(false) if not.
 * Returns err("hibp_unavailable") on network/API failure so callers can decide
 * their fail-open/closed policy explicitly.
 */
export async function isPasswordPwned(
  password: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Result<boolean, "hibp_unavailable">> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  try {
    const res = await fetchImpl(`${RANGE_URL}${prefix}`, {
      headers: { "Add-Padding": "true" },
    });
    if (!res.ok) return err("hibp_unavailable");
    const body = await res.text();
    const pwned = body.split("\n").some((line) => {
      const [suf, count] = line.trim().split(":");
      return suf?.toUpperCase() === suffix && (count ?? "0").trim() !== "0";
    });
    return ok(pwned);
  } catch {
    return err("hibp_unavailable");
  }
}
