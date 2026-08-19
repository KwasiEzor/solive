import { Fragment, type ReactNode } from "react";

/**
 * Server-side Tiptap JSON renderer (SLV-053). Walks the stored JSON and emits
 * React elements from a strict whitelist of nodes and marks — never
 * dangerouslySetInnerHTML, so stored content can't inject markup or scripts.
 * Unknown nodes/marks are dropped.
 */
export interface TiptapNode {
  type?: string;
  text?: string;
  content?: TiptapNode[];
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function safeHref(href: unknown): string | undefined {
  if (typeof href !== "string") return undefined;
  try {
    const url = new URL(href, "https://solive.pro");
    if (["http:", "https:", "mailto:"].includes(url.protocol)) return href;
  } catch {
    /* invalid */
  }
  return undefined;
}

function applyMarks(text: ReactNode, marks: TiptapNode["marks"]): ReactNode {
  if (!marks) return text;
  return marks.reduce<ReactNode>((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{acc}</strong>;
      case "italic":
        return <em>{acc}</em>;
      case "code":
        return <code>{acc}</code>;
      case "strike":
        return <s>{acc}</s>;
      case "link": {
        const href = safeHref(mark.attrs?.href);
        if (!href) return acc;
        return (
          <a href={href} rel="noopener noreferrer nofollow" target="_blank">
            {acc}
          </a>
        );
      }
      default:
        return acc;
    }
  }, text);
}

function renderNode(node: TiptapNode, key: number): ReactNode {
  const children = (node.content ?? []).map((c, i) => renderNode(c, i));

  switch (node.type) {
    case "text":
      return (
        <Fragment key={key}>{applyMarks(node.text ?? "", node.marks)}</Fragment>
      );
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const level = Number(node.attrs?.level);
      const Tag = ([2, 3, 4].includes(level) ? `h${level}` : "h3") as "h2";
      return <Tag key={key}>{children}</Tag>;
    }
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "hardBreak":
      return <br key={key} />;
    case "doc":
      return <Fragment key={key}>{children}</Fragment>;
    default:
      // Unknown node — render its children only (drop the wrapper).
      return <Fragment key={key}>{children}</Fragment>;
  }
}

export function renderTiptap(doc: unknown): ReactNode {
  if (!doc || typeof doc !== "object") return null;
  return renderNode(doc as TiptapNode, 0);
}

/** Plain-text extraction (for meta descriptions, previews, JSON-LD). */
export function tiptapToText(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";
  const walk = (n: TiptapNode): string => {
    if (typeof n.text === "string") return n.text;
    const inner = (n.content ?? []).map(walk).join("");
    return n.type === "paragraph" || n.type === "heading" ? `${inner}\n` : inner;
  };
  return walk(doc as TiptapNode).trim();
}
