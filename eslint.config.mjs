import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Hidash OS core: import from "@/lib/os" only, never its internals.
    ignores: ["lib/os/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/lib/os/*"], message: 'Import from "@/lib/os" (the public surface).' }] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
