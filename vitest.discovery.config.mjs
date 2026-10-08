import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  oxc: { jsx: { runtime: "automatic" } },
  test: { environment: "node", include: ["tests/site-access.test.ts", "tests/manage.test.ts", "tests/editorial-pivot.test.tsx", "tests/venue-hours-action.test.ts", "tests/events.test.ts", "tests/urbanos-talavera.test.ts"] },
});
