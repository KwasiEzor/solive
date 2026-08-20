/**
 * Solive monogram — a structural "S" drawn in beams, with the joist rails at
 * its terminals. Keeps the "qui tient debout" concept in a letterform.
 */
export function Mark({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M33 13 H15 V24 H33 V35 H15" />
      <path d="M33 9.5 V16.5" />
      <path d="M15 31.5 V38.5" />
    </svg>
  );
}

export function Tick() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M2 7.5 L5.5 11 L12 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
