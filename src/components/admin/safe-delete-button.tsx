"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type AdminDeleteResult =
  | { ok: true }
  | { ok: false; error: string };

type SafeDeleteButtonProps = {
  action: () => Promise<AdminDeleteResult>;
  entityLabel: string;
  redirectTo: string;
};

export function SafeDeleteButton({
  action,
  entityLabel,
  redirectTo,
}: SafeDeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Vas a eliminar ${entityLabel} definitivamente. Esta acción no se puede deshacer. ¿Quieres continuar?`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.replace(redirectTo);
        router.refresh();
      } catch {
        setError("No se pudo eliminar. Revisa la conexión y vuelve a intentarlo.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-950">Zona de eliminación</p>
      <p className="mt-1 text-sm leading-6 text-red-900/75">
        Solo se completará si no hay contenido relacionado que pueda perderse.
      </p>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-700/25 bg-white px-5 text-sm font-bold text-red-800 disabled:cursor-wait disabled:opacity-55"
      >
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        {isPending ? "Comprobando..." : "Eliminar"}
      </button>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold leading-6 text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
