const base = require("eslint-config-alfonz/rules/base");
const typescript = require("eslint-config-alfonz/rules/typescript");

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "standard",
    "plugin:@typescript-eslint/eslint-recommended"
  ],
  plugins: [
    "@typescript-eslint"
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.json"
  },
  rules: {
    ...base,
    ...typescript,
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],
    "node/no-deprecated-api": "off",
    "no-use-before-define": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "@typescript-eslint/camelcase": "off",
    "multiline-ternary": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false
      }
    ],
    "@typescript-eslint/naming-convention": "off"
  }
};
