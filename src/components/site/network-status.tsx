"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { flushContactQueue } from "@/lib/offline/flush";
import { queuedCount } from "@/lib/offline/queue";

const pill = {
  position: "fixed" as const,
  left: "16px",
  bottom: "16px",
  zIndex: 70,
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid var(--line)",
  background: "var(--nav)",
  backdropFilter: "blur(12px)",
  color: "var(--dim)",
  fontSize: "12px",
  boxShadow: "var(--shadow-md)",
};

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/** Discreet, non-anxious network + pending-queue indicator (SLV-085). */
export function NetworkStatus() {
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
  const [pending, setPending] = useState(0);

  useEffect(() => {
    // Retry the flush whenever we're online with a non-empty queue — resilient
    // to a reconnect that races the online event (SLV-083).
    const refresh = async () => {
      const n = await queuedCount().catch(() => 0);
      setPending(n);
      if (n > 0 && navigator.onLine) {
        await flushContactQueue().catch(() => {});
        setPending(await queuedCount().catch(() => 0));
      }
    };
    void refresh();
    const t = setInterval(refresh, 4000);
    const onOnline = () => void refresh();
    window.addEventListener("online", onOnline);
    return () => {
      clearInterval(t);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (online && pending === 0) return null;

  return (
    <div role="status" aria-live="polite" style={pill}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: online ? "var(--acc)" : "#f59e0b",
        }}
      />
      {!online
        ? "Hors ligne — vos actions sont conservées"
        : `${pending} demande${pending > 1 ? "s" : ""} en attente d’envoi`}
    </div>
  );
}
