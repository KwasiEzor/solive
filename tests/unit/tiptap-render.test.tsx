import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderTiptap, tiptapToText } from "@/lib/tiptap/render";

const html = (doc: unknown) => renderToStaticMarkup(<>{renderTiptap(doc)}</>);

const doc = (content: unknown[]) => ({ type: "doc", content });

describe("renderTiptap (SLV-053)", () => {
  it("renders paragraphs and headings", () => {
    const out = html(
      doc([
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Titre" }] },
        { type: "paragraph", content: [{ type: "text", text: "Corps" }] },
      ]),
    );
    expect(out).toBe("<h2>Titre</h2><p>Corps</p>");
  });

  it("applies whitelisted marks", () => {
    const out = html(
      doc([
        {
          type: "paragraph",
          content: [
            { type: "text", text: "gras", marks: [{ type: "bold" }] },
            { type: "text", text: "ital", marks: [{ type: "italic" }] },
          ],
        },
      ]),
    );
    expect(out).toContain("<strong>gras</strong>");
    expect(out).toContain("<em>ital</em>");
  });

  it("renders safe links, drops javascript: URLs", () => {
    const ok = html(
      doc([
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "lien",
              marks: [{ type: "link", attrs: { href: "https://x.be" } }],
            },
          ],
        },
      ]),
    );
    expect(ok).toContain('href="https://x.be"');
    expect(ok).toContain('rel="noopener noreferrer nofollow"');

    const bad = html(
      doc([
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "xss",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
      ]),
    );
    expect(bad).not.toContain("javascript:");
    expect(bad).toBe("<p>xss</p>");
  });

  it("drops unknown nodes but keeps their text", () => {
    const out = html(
      doc([
        {
          type: "evilNode",
          content: [{ type: "paragraph", content: [{ type: "text", text: "safe" }] }],
        },
      ]),
    );
    expect(out).toBe("<p>safe</p>");
  });

  it("never emits raw script markup from text", () => {
    const out = html(
      doc([{ type: "paragraph", content: [{ type: "text", text: "<script>alert(1)</script>" }] }]),
    );
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
  });

  it("renders code, strike, lists, quote, break, h3", () => {
    const out = html(
      doc([
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "H3" }] },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "c", marks: [{ type: "code" }] },
            { type: "text", text: "s", marks: [{ type: "strike" }] },
            { type: "hardBreak" },
            { type: "text", text: "x", marks: [{ type: "unknownMark" }] },
          ],
        },
        { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "q" }] }] },
        {
          type: "orderedList",
          content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "1" }] }] }],
        },
        {
          type: "bulletList",
          content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "b" }] }] }],
        },
      ]),
    );
    expect(out).toContain("<h3>H3</h3>");
    expect(out).toContain("<code>c</code>");
    expect(out).toContain("<s>s</s>");
    expect(out).toContain("<br/>");
    expect(out).toContain("<blockquote>");
    expect(out).toContain("<ol>");
    expect(out).toContain("<ul>");
  });

  it("falls back to h3 for out-of-range heading levels and null docs", () => {
    expect(html({ type: "heading", attrs: { level: 9 }, content: [{ type: "text", text: "z" }] })).toBe("<h3>z</h3>");
    expect(renderTiptap(null)).toBeNull();
    expect(renderTiptap("nope")).toBeNull();
    expect(tiptapToText(null)).toBe("");
    expect(tiptapToText(42)).toBe("");
  });

  it("drops a link with a non-string href", () => {
    const out = html(
      doc([
        {
          type: "paragraph",
          content: [{ type: "text", text: "n", marks: [{ type: "link", attrs: { href: 42 } }] }],
        },
      ]),
    );
    expect(out).toBe("<p>n</p>");
  });

  it("extracts plain text", () => {
    expect(
      tiptapToText(
        doc([
          { type: "paragraph", content: [{ type: "text", text: "un" }] },
          { type: "paragraph", content: [{ type: "text", text: "deux" }] },
        ]),
      ),
    ).toBe("un\ndeux");
  });
});
