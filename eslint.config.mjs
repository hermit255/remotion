import { config } from "@remotion/eslint-config-flat";

export default [
  ...config,
  {
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-member-accessibility": "error",
      "@typescript-eslint/no-inferrable-types": "off",
    },
  },
];
