import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/design-system/badge";

const meta = {
  title: "Design System/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "accent", "warning", "danger", "success"],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
  },
  args: {
    children: "Recogida local",
    tone: "neutral",
    size: "sm",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

export const Accent: Story = {
  args: {
    tone: "accent",
    children: "Destacado",
  },
};

export const Warning: Story = {
  args: {
    tone: "warning",
    children: "Ultimas unidades",
  },
};

export const Danger: Story = {
  args: {
    tone: "danger",
    children: "Cerrado",
  },
};

export const Success: Story = {
  args: {
    tone: "success",
    children: "Verificado",
  },
};

export const WithIcon: Story = {
  args: {
    tone: "accent",
    icon: <Sparkles size={14} />,
    children: "Favorito del barrio",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge size="sm">Pequeno</Badge>
      <Badge size="md">Medio</Badge>
    </div>
  ),
};

export const ActiveFilter: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge tone="neutral">Todos</Badge>
      <Badge tone="accent" active icon={<Check size={14} />}>
        Cerca de mi
      </Badge>
      <Badge tone="warning">Hoy</Badge>
    </div>
  ),
};

