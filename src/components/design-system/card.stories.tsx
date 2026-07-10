import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@/components/design-system/badge";
import { Button } from "@/components/design-system/button";
import { Card } from "@/components/design-system/card";

const meta = {
  title: "Design System/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["surface", "media", "ticket", "admin"],
    },
    padding: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    variant: "surface",
    padding: "md",
    children: "Contenido de card",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Surface: Story = {
  render: () => (
    <Card className="max-w-sm">
      <Badge tone="accent">Pickyalo</Badge>
      <h3 className="mt-4 text-xl font-semibold text-text-primary">
        Plato listo para recoger
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Una superficie clara para contenido de producto, locales y mensajes.
      </p>
    </Card>
  ),
};

export const Media: Story = {
  render: () => (
    <Card variant="media" padding="sm" className="max-w-sm">
      <div className="flex aspect-[4/3] items-end rounded-[var(--radius-lg)] bg-accent-soft p-4">
        <Badge tone="accent" active>
          Imagen
        </Badge>
      </div>
      <div className="p-2">
        <h3 className="mt-3 text-xl font-semibold text-text-primary">
          Card con media
        </h3>
        <p className="mt-2 text-sm text-text-secondary">
          Preparada para imagen real de comida o local.
        </p>
      </div>
    </Card>
  ),
};

export const Ticket: Story = {
  render: () => (
    <Card variant="ticket" className="max-w-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Recogida
      </p>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-text-primary">Croquetas</p>
          <p className="text-sm text-text-secondary">Listas en 15 min</p>
        </div>
        <p className="font-semibold text-text-primary">6,90 EUR</p>
      </div>
    </Card>
  ),
};

export const Admin: Story = {
  render: () => (
    <Card variant="admin" className="max-w-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Admin
      </p>
      <h3 className="mt-3 text-xl font-semibold text-text-primary">
        Panel tokenizado
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Variante preparada para formularios y metricas del backoffice.
      </p>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card interactive className="max-w-sm">
      <h3 className="text-xl font-semibold text-text-primary">
        Local destacado
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Hover con borde fuerte, sombra oficial y elevacion suave.
      </p>
      <Button className="mt-5" size="sm">
        Ver menu
      </Button>
    </Card>
  ),
};

export const PaddingVariants: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card padding="sm">Padding sm</Card>
      <Card padding="md">Padding md</Card>
      <Card padding="lg">Padding lg</Card>
    </div>
  ),
};

