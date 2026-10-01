const js = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    ignores: [
      "dist",
      "coverage",
      ".esbuild",
      ".serverless",
      "node_modules",
      "public",
      "eslint.config.js",
      "jest.config.js",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.node, ...globals.jest },
    },
  },
);
