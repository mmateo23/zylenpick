import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: [
    "../src/components/design-system/**/*.stories.@(ts|tsx|mdx)",
    "../docs/design-system/**/*.mdx"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {
      nextjs: {
        appDirectory: true,
      },
    },
  },
  staticDirs: [
    "../public"
  ]
};
export default config;
