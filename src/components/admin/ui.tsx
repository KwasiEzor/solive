import type { ReactNode } from "react";

/** Consistent page heading with optional right-aligned actions. */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--dim)]">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export type BadgeTone = "neutral" | "green" | "amber" | "red" | "blue";

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return <span className={`adm-badge ${tone}`}>{children}</span>;
}
