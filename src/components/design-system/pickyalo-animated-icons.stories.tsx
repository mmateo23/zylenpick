import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  HotPlateIcon,
  PaperBagIcon,
  PickupOrderIcon,
  PickyaloFavoriteIcon,
  PickyaloLocationIcon,
  PickyaloVerifiedIcon,
} from "@/components/icons/pickyalo";

const meta = {
  title: "Design System/Animated Icons",
  component: PaperBagIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PaperBagIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

const icons = [
  { label: "Añadir", Icon: PaperBagIcon },
  { label: "Plato caliente", Icon: HotPlateIcon },
  { label: "Ubicación", Icon: PickyaloLocationIcon },
  { label: "Favorito", Icon: PickyaloFavoriteIcon },
  { label: "Verificado", Icon: PickyaloVerifiedIcon },
  { label: "Recoger", Icon: PickupOrderIcon },
] as const;

function AnimatedIconGallery() {
  const [triggerKey, setTriggerKey] = useState(0);
  const [favoriteActive, setFavoriteActive] = useState(true);

  const replay = () => {
    setTriggerKey((currentKey) => currentKey + 1);
    setFavoriteActive((currentValue) => !currentValue);
  };

  return (
    <div className="w-[min(92vw,44rem)] rounded-3xl bg-[#FFF7E8] p-6 text-[#741314] shadow-sm sm:p-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {icons.map(({ label, Icon }) => (
          <div
            key={label}
            className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-[#741314]/12 bg-white/70 p-4"
          >
            <Icon
              size={42}
              strokeWidth={2.15}
              animated
              active={label === "Favorito" ? favoriteActive : undefined}
              loop={label === "Plato caliente"}
              triggerKey={triggerKey}
              title={label}
            />
            <span className="text-center text-xs font-semibold">{label}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={replay}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#741314] px-5 text-sm font-semibold text-[#FDE3AD]"
      >
        Repetir animaciones
      </button>
    </div>
  );
}

export const Gallery: Story = {
  render: () => <AnimatedIconGallery />,
};
