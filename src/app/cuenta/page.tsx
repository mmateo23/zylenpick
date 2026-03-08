import Link from "next/link";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import {
  getCurrentProfile,
  getOwnedVenuesForCurrentUser,
  requireUser,
} from "@/features/auth/services/auth-service";

export default async function AccountPage() {
  await requireUser();

  const profile = await getCurrentProfile();
  const ownedVenues = await getOwnedVenuesForCurrentUser();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6 sm:px-6">
      <section className="app-shell-shadow flex flex-1 flex-col rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-[color:var(--brand)]">
            Cuenta
          </p>
          <h1 className="text-3xl font-semibold text-[color:var(--foreground)]">
            {profile?.fullName || "Tu perfil"}
          </h1>
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            {profile?.email}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-[1.3rem] bg-[color:var(--surface-strong)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Rol
            </p>
            <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
              {profile?.role === "merchant" ? "Merchant" : "Cliente"}
            </p>
          </div>

          <div className="rounded-[1.3rem] bg-[color:var(--surface-strong)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Locales
            </p>
            <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
              {ownedVenues.length}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[color:var(--border)] bg-white p-5">
          <p className="text-sm font-semibold text-[color:var(--foreground)]">
            Ownership basico
          </p>

          {ownedVenues.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {ownedVenues.map((venue) => (
                <li
                  key={venue.id}
                  className="rounded-[1rem] bg-[color:var(--surface-strong)] px-4 py-3"
                >
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                    {venue.name}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    {venue.membershipRole} · /{venue.slug}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              Todavia no tienes ningun local asociado. En esta fase puedes crear
              usuarios merchant y asignar ownership desde Supabase para preparar el
              panel futuro.
            </p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/"
            className="rounded-[1.1rem] bg-[color:var(--surface-strong)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--foreground)]"
          >
            Volver al feed
          </Link>
          <SignOutButton />
        </div>

        {profile?.role === "merchant" ? (
          <Link
            href="/panel-comercio"
            className="mt-4 rounded-[1.1rem] border border-[color:var(--border)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--foreground)]"
          >
            Ir al espacio merchant
          </Link>
        ) : null}
      </section>
    </main>
  );
}
