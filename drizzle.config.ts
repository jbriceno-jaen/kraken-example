import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import * as path from "path";

// Explicitly load .env.local file first (Next.js convention)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Fallback to .env if .env.local doesn't exist or DATABASE_URL not found
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Please ensure you have a .env.local file in the project root with:\n" +
    "DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require"
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
