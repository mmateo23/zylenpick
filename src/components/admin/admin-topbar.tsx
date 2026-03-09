import { SignOutButton } from "@/features/auth/components/sign-out-button";

type AdminTopbarProps = {
  email: string | null;
};

export function AdminTopbar({ email }: AdminTopbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-[1.8rem] border border-white/10 bg-[color:var(--surface)] px-5 py-4 shadow-[var(--soft-shadow)]">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
          Panel admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
          Control centralizado del MVP
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full border border-white/10 bg-[color:var(--surface-strong)] px-4 py-2 text-sm text-[color:var(--muted-strong)]">
          {email ?? "Sesión activa"}
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
