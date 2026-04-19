"use client";

import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SignOutButtonProps = {
  variant?: "default" | "danger";
};

export function SignOutButton({ variant = "default" }: SignOutButtonProps) {
  const router = useRouter();
  const className =
    variant === "danger"
      ? "rounded-[1.1rem] border border-red-300/40 bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(239,68,68,0.32)] transition hover:bg-red-400"
      : "rounded-[1.1rem] bg-[color:var(--foreground)] px-4 py-3 text-sm font-semibold text-white";

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={className}
    >
      Cerrar sesion
    </button>
  );
}
