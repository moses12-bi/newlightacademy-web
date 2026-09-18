import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/**
 * `npm run lint` called `eslint` while ESLint was absent from devDependencies,
 * so linting had never actually run on this project. Added so the brand/content
 * pass could be validated; the config is the one Next 16 documents for the App
 * Router, with nothing loosened.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Playwright/verification helpers: plain CommonJS scripts run by node, not
    // part of the app bundle.
    "scripts/**",
  ]),
]);

export default eslintConfig;
