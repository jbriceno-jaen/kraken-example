import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    const errorMessage = [
      "DATABASE_URL environment variable is not set.",
      "",
      "Please ensure:",
      "1. You have a .env.local file in the project root (same directory as package.json)",
      "2. The file contains: DATABASE_URL=your_connection_string",
      "3. There are NO spaces around the = sign",
      "4. You've restarted your Next.js dev server after creating/updating .env.local",
      "",
      "Example .env.local:",
      "DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require",
      "",
      "Current working directory: " + process.cwd(),
    ].join("\n");
    
    throw new Error(errorMessage);
  }
  
  // Validate connection string format for Neon
  if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
    throw new Error(
      `Invalid DATABASE_URL format. Expected postgresql:// or postgres://, got: ${databaseUrl.substring(0, 20)}...`
    );
  }
  
  // Ensure sslmode is set for Neon (required for secure connections)
  // Parse the connection string properly
  try {
    const url = new URL(databaseUrl.replace(/^postgres(ql)?:/, "http:"));
    if (!url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
      return url.toString().replace(/^http:/, "postgresql:");
    }
  } catch {
    // If URL parsing fails, return as-is (might be a valid format we don't recognize)
  }
  
  return databaseUrl;
}

// Initialize connection with Neon HTTP driver
// Note: For scripts, make sure to import 'dotenv/config' BEFORE importing this module
// Next.js automatically loads .env.local for the runtime
const databaseUrl = getDatabaseUrl();
const sql = neon(databaseUrl);
export const db = drizzle({ client: sql });
export { sql };
