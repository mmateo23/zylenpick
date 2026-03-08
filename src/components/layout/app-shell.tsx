import { ReactNode } from "react";

import { BottomNavigation } from "@/components/navigation/bottom-navigation";

type AppShellProps = {
  children: ReactNode;
};

const navigationItems = [
  { label: "Descubrir", href: "/" },
  { label: "Favoritos", href: "/favoritos" },
  { label: "Carrito", href: "/carrito" },
  { label: "Pedidos", href: "/pedidos" },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-4 sm:px-6">
      <div className="app-shell-shadow flex min-h-[calc(100vh-2rem)] flex-1 flex-col overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)]/95 backdrop-blur">
        <div className="flex flex-1 flex-col">{children}</div>
        <BottomNavigation items={navigationItems} />
      </div>
    </main>
  );
}
