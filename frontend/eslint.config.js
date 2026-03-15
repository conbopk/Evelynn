// eslint.config.js
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default tseslint.config(
    // ── 1. Ignore .next build output ─────────────────────────────────
    { ignores: [".next"] },

    // ── 2. Next.js + React rules (thay thế next/core-web-vitals) ─────
    {
      plugins: {
        "@next/next": nextPlugin,
        react: reactPlugin,
        "react-hooks": reactHooksPlugin,
      },
      rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs["core-web-vitals"].rules,
        ...reactHooksPlugin.configs.recommended.rules,
        "react/react-in-jsx-scope": "off", // không cần import React với Next.js
        "react/prop-types": "off",         // TypeScript đã handle prop types
      },
      settings: {
        react: { version: "detect" },
      },
    },

    // ── 3. TypeScript rules (chỉ áp dụng cho .ts/.tsx) ───────────────
    {
      files: ["**/*.ts", "**/*.tsx"],
      extends: [
        tseslint.configs.recommended,
        tseslint.configs.recommendedTypeChecked,
        tseslint.configs.stylisticTypeChecked,
      ],
      rules: {
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/consistent-type-imports": [
          "warn",
          { prefer: "type-imports", fixStyle: "inline-type-imports" },
        ],
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/no-misused-promises": [
          "error",
          { checksVoidReturn: { attributes: false } },
        ],
      },
    },

    // ── 4. Global linter options ──────────────────────────────────────
    {
      linterOptions: { reportUnusedDisableDirectives: true },
      languageOptions: {
        parserOptions: { projectService: true },
      },
    },
);