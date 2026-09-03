"use client";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteLeadAction } from "@/server/actions/leads";

/** Single-delete from the lead detail page — confirm, then redirect back to
 * the inbox (this page's own data is gone once the action succeeds). */
export function DeleteLeadButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleDelete() {
    if (
      !window.confirm(`Supprimer la demande de « ${name} » ? Cette action est définitive.`)
    )
      return;
    start(async () => {
      const res = await deleteLeadAction(id);
      if (res.ok) {
        router.push("/admin/demandes");
      } else {
        window.alert("Échec de la suppression — réessayez.");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleDelete}
      className="adm-btn adm-btn-ghost text-[#ef6b6b]"
    >
      <Trash2 size={15} /> Supprimer
    </button>
  );
}
