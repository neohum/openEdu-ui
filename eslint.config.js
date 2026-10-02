import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "out/**",
      "scripts/loop/**",
      "scripts/dev/**",
      "scripts/release/**",
      "scripts/ops/*.mjs",
      "scripts/ops/verify-responsive.ts",
      "scripts/*.ts",
      ".agents/**",
      ".claude/**",
      ".codex/**",
      ".dagger/**",
      ".harness/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
