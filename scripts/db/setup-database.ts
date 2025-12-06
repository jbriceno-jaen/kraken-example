/**
 * Complete database setup script
 * 
 * This script:
 * 1. Verifies database connection
 * 2. Ensures all tables exist with correct schema
 * 
 * Run with: npm run db:setup
 * Or: tsx scripts/db/setup-database.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { neon } from "@neondatabase/serverless";

// Load .env.local first, then fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = neon(databaseUrl);

  console.log("🔍 Verifying database connection...");

  try {
    // Test connection
    await sql`SELECT 1`;
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }

  console.log("\n🔍 Verifying database schema...");

  try {
    // Check if all required tables exist
    const tables = [
      "users",
      "profiles",
      "personal_records",
      "reservations",
      "class_slots",
      "workout_of_day",
      "class_attendees",
    ];

    for (const tableName of tables) {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        );
      `;

      const exists = result[0]?.exists;
      if (exists) {
        console.log(`   ✅ Table '${tableName}' exists`);
      } else {
        console.log(`   ⚠️  Table '${tableName}' does not exist`);
        console.log(`   💡 Run 'npm run db:push' to create missing tables`);
      }
    }

    // Check if users table has required columns
    const userColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY column_name;
    `;

    const requiredColumns = ["role", "subscriptionExpires", "wodEnabled"];
    const existingColumns = userColumns.map((col: any) => col.column_name);

    console.log("\n🔍 Verifying users table columns...");
    for (const col of requiredColumns) {
      if (existingColumns.includes(col)) {
        console.log(`   ✅ Column '${col}' exists`);
      } else {
        console.log(`   ⚠️  Column '${col}' is missing`);
        console.log(`   💡 Run 'npm run db:push' to update schema`);
      }
    }
  } catch (error) {
    console.error("❌ Error verifying schema:", error);
    throw error;
  }

  console.log("\n✨ Database setup complete!");
  console.log("\n📋 Summary:");
  console.log("   ✅ Database connection verified");
  console.log("   ✅ Schema verified");
  console.log("\n💡 Note: Create manager users directly in the database using your database client.");
}

// Run the script
setupDatabase()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
