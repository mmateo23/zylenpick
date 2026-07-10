import type { Preview } from "@storybook/nextjs-vite";
import { useEffect } from "react";

import "../src/app/globals.css";

function PickyaloPreviewFrame(Story: React.ComponentType) {
  useEffect(() => {
    document.documentElement.style.backgroundColor = "#f6f1e6";
    document.body.style.backgroundColor = "#f6f1e6";

    return () => {
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-page p-6 text-text-primary">
      <Story />
    </div>
  );
}

const preview: Preview = {
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "Pickyalo crema",
      values: [
        { name: "Pickyalo crema", value: "var(--bg-page)" },
        { name: "Pickyalo alternativo", value: "var(--bg-page-alt)" },
        { name: "Superficie", value: "var(--bg-surface-strong)" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [PickyaloPreviewFrame],
};

export default preview;
