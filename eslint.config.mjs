import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third-party agent skills (npx skills add …): not site code.
    ".agents/**",
    // Vendored Stageshow kit (MIT, benjitaylor/skills): kept as shipped.
    "components/stageshow/kit/**",
  ]),
]);

export default eslintConfig;
