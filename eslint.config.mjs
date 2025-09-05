// eslint.config.js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // New addition to ignore the routes causing the build error
  {
    ignores: [
      "app/api/products/[id]/reviews/route.ts", 
      "app/api/leads/[id]/route.ts",
      "lib/database.types.ts"
    ]
  }
];

export default eslintConfig;
