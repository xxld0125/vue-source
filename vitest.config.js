import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["__tests__/**/*.spec.js"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/dist-docs/**",
      "**/docs/**",
      "**/coverage/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.js"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/dist-docs/**",
        "**/docs/**",
        "**/coverage/**",
        "**/*.d.ts",
      ],
      all: true,
      thresholds: {
        statements: 87,
        branches: 85,
        functions: 90,
        lines: 87,
      },
    },
  },
});
