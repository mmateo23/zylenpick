import { SignOutButton } from "@/features/auth/components/sign-out-button";

export function AdminUnauthorizedState({ email }: { email: string | null }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-10 sm:px-6">
      <section className="glass-panel w-full rounded-[2rem] border border-[color:var(--border)] p-8 shadow-[var(--shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--brand)]">
          Panel admin
        </p>
        <h1 className="mt-5 text-4xl font-semibold text-[color:var(--foreground)]">
          Acceso no autorizado
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
          Esta cuenta ha iniciado sesión, pero su email no está incluido en la
          allowlist del panel admin.
        </p>
        <div className="mt-6 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-4">
          <p className="text-sm text-[color:var(--muted)]">Email detectado</p>
          <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
            {email ?? "No disponible"}
          </p>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}
