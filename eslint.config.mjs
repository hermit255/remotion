import { config } from "@remotion/eslint-config-flat";
import tseslint from 'typescript-eslint';

export default [
  ...config,
  {
    files: ['**/*.ts', '**/*.tsx'],
    // strict設定を拡張すると、no-explicit-anyも含まれます
    ...tseslint.configs.strict,
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-member-accessibility": "error",
      "@typescript-eslint/no-inferrable-types": "off",
    },
  },
];
