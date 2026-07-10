import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, Check, MapPin, Sparkles } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  SectionHeader,
} from "@/components/design-system";

const meta = {
  title: "Design System/Overview",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const PickyaloBase: Story = {
  render: () => (
    <main className="min-h-screen bg-page px-5 py-10 text-text-primary sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <SectionHeader
          eyebrow="Design system v0.1"
          title="Piezas base de Pickyalo"
          description="Componentes inertes preparados para Storybook y futura migracion visual, usando el contrato de tokens oficial."
          action={<Button rightIcon={<ArrowRight size={17} />}>Siguiente fase</Button>}
        />

        <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <Card variant="media" padding="lg" interactive>
            <div className="flex min-h-72 flex-col justify-between rounded-[var(--radius-xl)] bg-accent-soft p-6">
              <div className="flex flex-wrap gap-2">
                <Badge tone="accent" active icon={<Sparkles size={14} />}>
                  Destacado
                </Badge>
                <Badge tone="neutral" icon={<MapPin size={14} />}>
                  A 8 min
                </Badge>
              </div>
              <div>
                <h3 className="max-w-lg text-4xl font-semibold leading-tight text-text-primary">
                  Comida real, cerca, lista para recoger.
                </h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-text-secondary">
                  Un bloque ejemplo con fondo crema, superficie clara y acento dorado sin tocar la UI real.
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Tokens oficiales
            </p>
            <div className="mt-5 grid gap-3">
              <Badge tone="accent" active>
                bg.page
              </Badge>
              <Badge tone="neutral">text.primary</Badge>
              <Badge tone="warning">status.warning</Badge>
              <Badge tone="danger">status.danger</Badge>
              <Badge tone="success" icon={<Check size={14} />}>
                component ready
              </Badge>
            </div>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <Card>
            <h3 className="text-lg font-semibold text-text-primary">Buttons</h3>
            <div className="mt-5 flex flex-col gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-text-primary">Badges</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>Neutral</Badge>
              <Badge tone="accent">Accent</Badge>
              <Badge tone="warning">Warning</Badge>
              <Badge tone="danger">Danger</Badge>
              <Badge tone="success">Success</Badge>
            </div>
          </Card>

          <Card interactive>
            <h3 className="text-lg font-semibold text-text-primary">Cards</h3>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Superficies claras, bordes sutiles y sombra suave para la futura migracion.
            </p>
            <Button className="mt-5" size="sm" rightIcon={<ArrowRight size={16} />}>
              Ver detalle
            </Button>
          </Card>
        </section>
      </div>
    </main>
  ),
};

