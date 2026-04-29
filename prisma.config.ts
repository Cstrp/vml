import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config();

export default defineConfig({
  datasource: { url: process.env.DATABASE_URL ?? "file:./dev.db" },
  experimental: { extensions: true, externalTables: false },
  migrations: { seed: "npx tsx prisma/seed.ts" },
  schema: "prisma/schema.prisma",
});
