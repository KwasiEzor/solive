import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { isPasswordPwned } from "@/server/services/hibp";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

async function sha1Upper(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

describe("isPasswordPwned (SLV-040, MSW)", () => {
  it("only sends the 5-char prefix (k-anonymity)", async () => {
    const pw = "correct horse battery staple";
    const hash = await sha1Upper(pw);
    let requestedPath = "";
    server.use(
      http.get("https://api.pwnedpasswords.com/range/:prefix", ({ params }) => {
        requestedPath = String(params.prefix);
        return HttpResponse.text(`${hash.slice(5)}:19`);
      }),
    );
    const res = await isPasswordPwned(pw);
    expect(res).toEqual({ ok: true, value: true });
    expect(requestedPath).toBe(hash.slice(0, 5));
    expect(requestedPath.length).toBe(5);
  });

  it("returns false when the suffix is absent", async () => {
    server.use(
      http.get("https://api.pwnedpasswords.com/range/:prefix", () =>
        HttpResponse.text("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:3"),
      ),
    );
    const res = await isPasswordPwned("a-very-unique-passphrase-9271");
    expect(res).toEqual({ ok: true, value: false });
  });

  it("ignores padded zero-count entries", async () => {
    const pw = "another-test-password";
    const hash = await sha1Upper(pw);
    server.use(
      http.get("https://api.pwnedpasswords.com/range/:prefix", () =>
        HttpResponse.text(`${hash.slice(5)}:0`),
      ),
    );
    const res = await isPasswordPwned(pw);
    expect(res).toEqual({ ok: true, value: false });
  });

  it("returns err on API failure", async () => {
    server.use(
      http.get("https://api.pwnedpasswords.com/range/:prefix", () =>
        HttpResponse.text("nope", { status: 503 }),
      ),
    );
    const res = await isPasswordPwned("whatever-password-here");
    expect(res).toEqual({ ok: false, error: "hibp_unavailable" });
  });
});
