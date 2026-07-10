import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Clock, MapPin, Star } from "lucide-react";
import { type ReactNode, useState } from "react";

import {
  Badge,
  Button,
  Card,
  SectionHeader,
} from "@/components/design-system";

const meta = {
  title: "Pickyalo Style Lab",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const brand = {
  primary: "#741314",
  cream: "#FDE3AD",
  text: "#24110E",
  surface: "#FFF7E8",
  border: "rgba(116, 19, 20, 0.16)",
  hover: "rgba(116, 19, 20, 0.08)",
  shadow: "0 18px 60px rgba(116, 19, 20, 0.12)",
};

const mainPalette = [
  { name: "Granate", value: brand.primary, background: brand.primary },
  { name: "Blanco hueso", value: brand.cream, background: brand.cream },
];

const supportPalette = [
  { name: "Texto oscuro", value: brand.text, background: brand.text },
  { name: "Surface clara", value: brand.surface, background: brand.surface },
  { name: "Border suave", value: "rgba(116, 19, 20, 0.16)", background: brand.border },
  { name: "Hover suave", value: "rgba(116, 19, 20, 0.08)", background: brand.hover },
];

const reversePalette = [
  { name: "Fondo granate", value: brand.primary, background: brand.primary },
  { name: "Texto hueso", value: brand.cream, background: brand.cream },
  { name: "Surface clara", value: brand.surface, background: brand.surface },
  { name: "Badge inverso", value: "rgba(253, 227, 173, 0.16)", background: "rgba(253, 227, 173, 0.16)" },
];

function BrandLogo() {
  const [src, setSrc] = useState("/logo/LogoNuevo.svg");

  return (
    <div className="flex min-h-16 items-center">
      <img
        src={src}
        alt="Pickyalo"
        className="h-auto max-h-16 w-44 object-contain"
        onError={() => setSrc("/logo/Pickyalo_Logo_Coral.svg")}
      />
    </div>
  );
}

function ReverseLogo() {
  const [src, setSrc] = useState("/logo/LogoNuevo_Negativo.svg");

  return (
    <div className="flex min-h-16 items-center">
      <img
        src={src}
        alt="Pickyalo"
        className="h-auto max-h-16 w-44 object-contain"
        onError={() => setSrc("/logo/Pickyalo_Logo_Vanilla.svg")}
      />
    </div>
  );
}

function BrandBadge({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Badge
      tone="accent"
      active
      icon={icon}
      className="border-[rgba(116,19,20,0.16)] bg-[rgba(116,19,20,0.08)] text-[#741314]"
    >
      {children}
    </Badge>
  );
}

function ReverseBadge({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Badge
      tone="accent"
      active
      icon={icon}
      className="border-[rgba(253,227,173,0.28)] bg-[rgba(253,227,173,0.16)] text-[#FDE3AD]"
    >
      {children}
    </Badge>
  );
}

function FoodCardPreview() {
  return (
    <Card
      variant="media"
      padding="sm"
      interactive
      className="border-[rgba(116,19,20,0.16)] bg-[#FFF7E8] shadow-[0_18px_60px_rgba(116,19,20,0.12)]"
    >
      <div className="relative min-h-[17rem] overflow-hidden rounded-[var(--radius-xl)] bg-[#FDE3AD]">
        <img
          src="/home/assets/asset_burger_transparent.png"
          alt="Burger Pickyalo"
          className="absolute inset-x-0 bottom-3 mx-auto w-[82%] drop-shadow-2xl"
        />
        <div className="absolute left-4 top-4">
          <BrandBadge icon={<Star size={14} />}>Destacado</BrandBadge>
        </div>
      </div>
      <div className="p-3 text-[#24110E]">
        <p className="text-sm font-medium opacity-70">La Plaza Burger</p>
        <h3 className="mt-2 text-2xl font-semibold leading-tight">
          Burger casera para recoger
        </h3>
        <div className="mt-4 flex items-center justify-between gap-3">
          <BrandBadge>12 min</BrandBadge>
          <p className="font-semibold">8,90 EUR</p>
        </div>
      </div>
    </Card>
  );
}

function ReverseFoodCardPreview() {
  return (
    <Card
      variant="media"
      padding="sm"
      interactive
      className="border-[rgba(253,227,173,0.28)] bg-[#FFF7E8] shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
    >
      <div className="relative min-h-[17rem] overflow-hidden rounded-[var(--radius-xl)] bg-[#FDE3AD]">
        <img
          src="/home/assets/asset_burger_transparent.png"
          alt="Burger Pickyalo"
          className="absolute inset-x-0 bottom-3 mx-auto w-[82%] drop-shadow-2xl"
        />
        <div className="absolute left-4 top-4">
          <BrandBadge icon={<Star size={14} />}>Destacado</BrandBadge>
        </div>
      </div>
      <div className="p-3 text-[#24110E]">
        <p className="text-sm font-medium opacity-70">La Plaza Burger</p>
        <h3 className="mt-2 text-2xl font-semibold leading-tight">
          Burger casera para recoger
        </h3>
        <div className="mt-4 flex items-center justify-between gap-3">
          <BrandBadge>12 min</BrandBadge>
          <p className="font-semibold">8,90 EUR</p>
        </div>
      </div>
    </Card>
  );
}

function VenueCardPreview() {
  return (
    <Card
      interactive
      className="border-[rgba(116,19,20,0.16)] bg-[#FFF7E8] text-[#24110E] shadow-[0_18px_60px_rgba(116,19,20,0.12)]"
    >
      <BrandBadge>Local verificado</BrandBadge>
      <h3 className="mt-4 text-2xl font-semibold">Mercado Chico</h3>
      <p className="mt-2 text-sm leading-6 opacity-70">
        Cocina local, platos cortos y recogida rapida en el centro.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <BrandBadge icon={<MapPin size={14} />}>700 m</BrandBadge>
        <BrandBadge icon={<Clock size={14} />}>15 min</BrandBadge>
      </div>
      <Button
        className="mt-6 bg-[#741314] text-[#FDE3AD] hover:bg-[#5f1011]"
        size="sm"
      >
        Ver local
      </Button>
    </Card>
  );
}

function ReverseVenueCardPreview() {
  return (
    <Card
      interactive
      className="border-[rgba(253,227,173,0.28)] bg-[#FDE3AD] text-[#741314] shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
    >
      <BrandBadge>Local verificado</BrandBadge>
      <h3 className="mt-4 text-2xl font-semibold">Mercado Chico</h3>
      <p className="mt-2 text-sm leading-6 text-[#24110E] opacity-75">
        Cocina local, platos cortos y recogida rapida en el centro.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <BrandBadge icon={<MapPin size={14} />}>700 m</BrandBadge>
        <BrandBadge icon={<Clock size={14} />}>15 min</BrandBadge>
      </div>
      <Button
        className="mt-6 bg-[#741314] text-[#FDE3AD] hover:bg-[#5f1011]"
        size="sm"
      >
        Ver local
      </Button>
    </Card>
  );
}

function PaletteSwatch({
  name,
  value,
  background,
  large = false,
}: {
  name: string;
  value: string;
  background: string;
  large?: boolean;
}) {
  return (
    <div
      className="rounded-[var(--radius-md)] border p-3"
      style={{ background: brand.surface, borderColor: brand.border }}
    >
      <div
        className={large ? "h-16 rounded-[var(--radius-sm)]" : "h-10 rounded-[var(--radius-sm)]"}
        style={{ background }}
      />
      <p className="mt-3 text-xs font-semibold" style={{ color: brand.text }}>
        {name}
      </p>
      <p className="mt-1 text-xs opacity-65" style={{ color: brand.text }}>
        {value}
      </p>
    </div>
  );
}

export const PickyaloBrandBase: Story = {
  name: "Pickyalo Brand Base",
  render: () => (
    <main className="min-h-screen" style={{ background: brand.cream, color: brand.text }}>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-8">
        <div
          className="flex min-h-[34rem] flex-col justify-between rounded-[var(--radius-xl)] p-7 sm:p-10"
          style={{
            background: brand.surface,
            border: `1px solid ${brand.border}`,
            boxShadow: brand.shadow,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <BrandLogo />
            <BrandBadge>Brand Base</BrandBadge>
          </div>

          <div className="mt-12">
            <BrandBadge>Recogida local</BrandBadge>
            <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[1.02] sm:text-6xl">
              {"Elige qu\u00e9 comer cerca"}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 opacity-75">
              Platos reales de locales cercanos para recoger sin vueltas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="bg-[#741314] text-[#FDE3AD] hover:bg-[#5f1011]">
                Explorar platos
              </Button>
              <Button
                variant="secondary"
                className="border-[#741314] bg-[#FDE3AD] text-[#741314] hover:bg-[rgba(116,19,20,0.08)]"
              >
                Ver zonas
              </Button>
              <Button
                variant="ghost"
                className="text-[#741314] hover:bg-[rgba(116,19,20,0.08)]"
              >
                Conocer proyecto
              </Button>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-5">
          <Card
            padding="lg"
            className="border-[rgba(116,19,20,0.16)] bg-[#FFF7E8] text-[#24110E]"
          >
            <SectionHeader
              eyebrow="Paleta principal"
              title="Granate + blanco hueso"
              description="Base oficial del nuevo logo para validar visualmente antes de migrar la UI real."
            />
            <div className="mt-7 grid grid-cols-2 gap-3">
              {mainPalette.map((item) => (
                <PaletteSwatch key={item.name} {...item} large />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {supportPalette.map((item) => (
                <PaletteSwatch key={item.name} {...item} />
              ))}
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <FoodCardPreview />
            <VenueCardPreview />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-8 sm:px-8 lg:grid-cols-[1fr_0.55fr]">
        <Card
          padding="lg"
          className="border-[rgba(116,19,20,0.16)] bg-[#FFF7E8] text-[#24110E]"
        >
          <SectionHeader
            eyebrow="Style decisions"
            title="Marca directa, calida y sencilla"
            description="Notas cortas para revisar el rumbo visual antes de migrar componentes reales."
          />
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Granate + blanco hueso como base",
              "Evitar capa dark legacy",
              "Usar assets reales",
              "Mantener diseno editorial y sencillo",
            ].map((decision) => (
              <BrandBadge key={decision}>{decision}</BrandBadge>
            ))}
          </div>
        </Card>

        <Card
          padding="md"
          className="border-[rgba(0,0,0,0.10)] bg-[#f6f1e6] text-[#181816]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
            Anterior / legacy visual
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <PaletteSwatch name="Crema anterior" value="#f6f1e6" background="#f6f1e6" />
            <PaletteSwatch name="Amarillo anterior" value="#fed47d" background="#fed47d" />
          </div>
        </Card>
      </section>
    </main>
  ),
};

export const PickyaloBrandReverse: Story = {
  name: "Pickyalo Brand Reverse",
  render: () => (
    <main className="min-h-screen bg-[#741314] text-[#FDE3AD]">
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-8">
        <div className="flex min-h-[34rem] flex-col justify-between rounded-[var(--radius-xl)] border border-[rgba(253,227,173,0.28)] bg-[#741314] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.18)] sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <ReverseLogo />
            <ReverseBadge>Brand Reverse</ReverseBadge>
          </div>

          <div className="mt-12">
            <ReverseBadge>Recogida local</ReverseBadge>
            <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[1.02] sm:text-6xl">
              {"Elige qu\u00e9 comer cerca"}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#FDE3AD]/80">
              Platos reales de locales cercanos para recoger sin vueltas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="bg-[#FDE3AD] text-[#741314] hover:bg-[#fff0c9]">
                Explorar platos
              </Button>
              <Button
                variant="secondary"
                className="border-[#FDE3AD] bg-transparent text-[#FDE3AD] hover:bg-[rgba(253,227,173,0.16)]"
              >
                Ver zonas
              </Button>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-5">
          <Card
            padding="lg"
            className="border-[rgba(253,227,173,0.28)] bg-[#FDE3AD] text-[#741314]"
          >
            <SectionHeader
              eyebrow="Paleta inversa"
              title="Granate como escenario"
              description="Version inversa para comparar fuerza de marca, contraste y uso en piezas principales."
            />
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {reversePalette.map((item) => (
                <PaletteSwatch key={item.name} {...item} />
              ))}
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <ReverseFoodCardPreview />
            <ReverseVenueCardPreview />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8">
        <Card
          padding="lg"
          className="border-[rgba(253,227,173,0.28)] bg-[rgba(253,227,173,0.12)] text-[#FDE3AD]"
        >
          <SectionHeader
            eyebrow="Nota visual"
            title="Uso recomendado"
            description="Version inversa pensada para hero, campanas, splash o piezas de marca. No necesariamente para toda la UI."
          />
        </Card>
      </section>
    </main>
  ),
};
