import { describe, expect, it } from "vitest";
import {
  buildLeadAcknowledgment,
  buildLeadNotification,
} from "@/server/services/email/messages";

describe("email messages (SLV-130/131/133)", () => {
  it("builds the internal notification with reply-to + admin link", async () => {
    const m = await buildLeadNotification({
      to: "studio@solive.be",
      name: "Camille Dupont",
      email: "camille@x.be",
      company: "Menuiserie",
      projectTypes: ["Site vitrine"],
      budgetRange: null,
      message: "Bonjour, un projet de site.",
      adminUrl: "https://solive.be/admin/demandes/abc",
    });
    expect(m.to).toBe("studio@solive.be");
    expect(m.subject).toContain("Camille Dupont");
    expect(m.replyTo).toBe("camille@x.be");
    expect(m.html).toContain("Menuiserie");
    expect(m.html).toContain("https://solive.be/admin/demandes/abc");
    // plain-text alternative is always present (SLV-133)
    expect(m.text.length).toBeGreaterThan(0);
    expect(m.text).not.toContain("<p>");
  });

  it("localises the acknowledgment and greets by first name", async () => {
    const fr = await buildLeadAcknowledgment({
      email: "c@x.be",
      name: "Camille Dupont",
      locale: "fr",
    });
    expect(fr.subject).toBe("Votre demande chez Solive");
    expect(fr.html).toContain("Merci Camille");

    const en = await buildLeadAcknowledgment({
      email: "c@x.be",
      name: "Sam",
      locale: "en",
    });
    expect(en.subject).toBe("Your request to Solive");
    expect(en.html).toContain("Thank you, Sam");

    const nl = await buildLeadAcknowledgment({
      email: "c@x.be",
      name: "Jan",
      locale: "nl",
    });
    expect(nl.html).toContain("Bedankt Jan");
  });
});
