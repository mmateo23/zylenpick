import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/design-system/button";
import { SectionHeader } from "@/components/design-system/section-header";

const meta = {
  title: "Design System/SectionHeader",
  component: SectionHeader,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    align: {
      control: "select",
      options: ["left", "center"],
    },
  },
  args: {
    title: "Platos cerca de ti",
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Centered: Story = {
  args: {
    align: "center",
    title: "Descubre comida real para recoger",
    description:
      "Una cabecera centrada para bloques editoriales, marketing y estados vacios.",
  },
};

export const WithEyebrow: Story = {
  args: {
    eyebrow: "Seleccion local",
    title: "Favoritos del barrio",
  },
};

export const WithDescription: Story = {
  args: {
    eyebrow: "Zonas",
    title: "Locales listos para recogida",
    description:
      "Agrupa restaurantes cercanos, tiempos estimados y una jerarquia clara para escanear rapido.",
  },
};

export const WithAction: Story = {
  args: {
    eyebrow: "Platos",
    title: "La seleccion de hoy",
    description:
      "Un bloque con accion para conectar encabezados de seccion con CTAs tokenizados.",
    action: <Button size="sm">Ver todo</Button>,
  },
};

