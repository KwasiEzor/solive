import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { BrevoMailer } from "@/server/services/email/brevo";

const URL = "https://api.brevo.com/v3/smtp/email";
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const msg = {
  to: "prospect@x.be",
  subject: "Hello",
  html: "<p>hi</p>",
  text: "hi",
};

describe("BrevoMailer (SLV-133)", () => {
  it("sends with api-key header and mapped payload", async () => {
    let apiKey = "";
    let payload: { sender?: { email: string }; to?: { email: string }[] } = {};
    server.use(
      http.post(URL, async ({ request }) => {
        apiKey = request.headers.get("api-key") ?? "";
        payload = (await request.json()) as typeof payload;
        return HttpResponse.json({ messageId: "1" }, { status: 201 });
      }),
    );
    const mailer = new BrevoMailer("KEY", { email: "no-reply@solive.be", name: "Solive" });
    const r = await mailer.send(msg);
    expect(r).toEqual({ ok: true, value: undefined });
    expect(apiKey).toBe("KEY");
    expect(payload.sender?.email).toBe("no-reply@solive.be");
    expect(payload.to?.[0]?.email).toBe("prospect@x.be");
  });

  it("returns email_send_failed on a 4xx", async () => {
    server.use(http.post(URL, () => HttpResponse.json({}, { status: 400 })));
    const mailer = new BrevoMailer("KEY", { email: "x@y.be", name: "S" });
    expect(await mailer.send(msg)).toEqual({ ok: false, error: "email_send_failed" });
  });
});
