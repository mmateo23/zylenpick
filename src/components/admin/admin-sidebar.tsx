import Link from "next/link";

const navigationItems = [
  { label: "Dashboard", href: "/panel", enabled: true },
  { label: "Locales", href: "/panel/locales", enabled: true },
  { label: "Platos", href: "#", enabled: false },
  { label: "Pedidos", href: "#", enabled: false },
  { label: "Solicitudes", href: "/panel/solicitudes", enabled: true },
];

export function AdminSidebar() {
  return (
    <aside className="rounded-[1.8rem] border border-white/10 bg-[color:var(--surface-dark)] px-5 py-6 text-white shadow-[var(--soft-shadow)]">
      <p className="text-xs font-medium uppercase tracking-[0.26em] text-white/58">
        Admin
      </p>
      <h2 className="mt-4 text-2xl font-semibold">ZylenPick</h2>

      <nav className="mt-7">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.label}>
              {item.enabled ? (
                <Link
                  href={item.href}
                  className="inline-flex w-full rounded-[1rem] border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="inline-flex w-full rounded-[1rem] border border-white/8 bg-white/5 px-4 py-3 text-sm font-medium text-white/42">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
