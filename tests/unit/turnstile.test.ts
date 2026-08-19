import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { verifyTurnstile } from "@/server/services/turnstile";

const URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("verifyTurnstile (SLV-055)", () => {
  it("returns ok when Cloudflare says success", async () => {
    server.use(http.post(URL, () => HttpResponse.json({ success: true })));
    expect(await verifyTurnstile("tok", "secret")).toEqual({
      ok: true,
      value: true,
    });
  });

  it("returns turnstile_failed when success is false", async () => {
    server.use(
      http.post(URL, () =>
        HttpResponse.json({ success: false, "error-codes": ["invalid-input"] }),
      ),
    );
    expect(await verifyTurnstile("bad", "secret")).toEqual({
      ok: false,
      error: "turnstile_failed",
    });
  });

  it("returns turnstile_unavailable on a non-200", async () => {
    server.use(http.post(URL, () => HttpResponse.text("boom", { status: 500 })));
    expect(await verifyTurnstile("tok", "secret")).toEqual({
      ok: false,
      error: "turnstile_unavailable",
    });
  });

  it("forwards the remote IP", async () => {
    let seenIp = "";
    server.use(
      http.post(URL, async ({ request }) => {
        const body = new URLSearchParams(await request.text());
        seenIp = body.get("remoteip") ?? "";
        return HttpResponse.json({ success: true });
      }),
    );
    await verifyTurnstile("tok", "secret", "203.0.113.7");
    expect(seenIp).toBe("203.0.113.7");
  });
});
