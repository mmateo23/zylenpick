import Link from "next/link";

import {
  getOwnedVenuesForCurrentUser,
  requireMerchant,
} from "@/features/auth/services/auth-service";

export default async function MerchantPage() {
  await requireMerchant();
  const ownedVenues = await getOwnedVenuesForCurrentUser();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6 sm:px-6">
      <section className="app-shell-shadow flex flex-1 flex-col rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-[color:var(--brand)]">
            Merchant MVP
          </p>
          <h1 className="text-3xl font-semibold text-[color:var(--foreground)]">
            Ownership preparado
          </h1>
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            Esta pantalla privada confirma que el usuario es merchant y deja lista
            la base para el panel de gestion.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {ownedVenues.length > 0 ? (
            ownedVenues.map((venue) => (
              <div
                key={venue.id}
                className="rounded-[1.3rem] bg-[color:var(--surface-strong)] p-4"
              >
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  {venue.name}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  Rol: {venue.membershipRole}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[1.3rem] border border-dashed border-[color:var(--border)] p-4">
              <p className="text-sm leading-6 text-[color:var(--muted)]">
                Tu cuenta merchant existe, pero aun no tiene ningun venue asociado.
              </p>
            </div>
          )}
        </div>

        <Link
          href="/cuenta"
          className="mt-6 rounded-[1.1rem] bg-[color:var(--foreground)] px-4 py-3 text-center text-sm font-semibold text-white"
        >
          Volver a cuenta
        </Link>
      </section>
    </main>
  );
}
