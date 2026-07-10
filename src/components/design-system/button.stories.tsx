import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, MapPin } from "lucide-react";

import { Button } from "@/components/design-system/button";

const meta = {
  title: "Design System/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    children: "Ver platos",
    variant: "primary",
    size: "md",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Elegir zona",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Cancelar",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Eliminar",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Pequeno</Button>
      <Button size="md">Medio</Button>
      <Button size="lg">Grande</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button leftIcon={<MapPin size={17} />}>Locales cerca</Button>
      <Button variant="secondary" rightIcon={<ArrowRight size={17} />}>
        Continuar
      </Button>
    </div>
  ),
};

export const FullWidth: Story = {
  parameters: {
    layout: "padded",
  },
  render: () => (
    <div className="max-w-md">
      <Button fullWidth>Reservar recogida</Button>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
    children: "Guardando",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "No disponible",
  },
};

