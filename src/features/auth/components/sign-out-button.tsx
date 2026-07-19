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
      ? "rounded-full border border-[#741314]/16 bg-transparent px-4 py-2.5 text-xs font-bold text-[#741314]/70 transition hover:border-[#741314]/28 hover:bg-[#741314]/[0.06] hover:text-[#741314] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
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
      Cerrar sesión
    </button>
  );
}
