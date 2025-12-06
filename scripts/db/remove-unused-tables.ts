/**
 * Script to remove unused database tables
 * 
 * This script removes the following unused tables:
 * - accounts (NextAuth table, not needed with JWT strategy)
 * - sessions (NextAuth table, not needed with JWT strategy)
 * - verification_tokens (NextAuth table, not currently used)
 * 
 * Run with: npm run db:remove-unused-tables
 * Or: tsx scripts/db/remove-unused-tables.ts
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function removeUnusedTables() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = neon(databaseUrl);

  console.log("🔍 Checking for unused tables...");

  const tablesToRemove = [
    "accounts",
    "sessions",
    "verification_tokens",
  ];

  try {
    for (const tableName of tablesToRemove) {
      // Check if table exists
      const checkTable = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        );
      `;

      const tableExists = checkTable[0]?.exists;

      if (tableExists) {
        console.log(`🗑️  Dropping table: ${tableName}...`);
        
        // Drop the table (CASCADE will also drop any dependent objects)
        // Use parameterized query to safely drop the table
        await sql.unsafe(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        
        console.log(`✅ Successfully dropped table: ${tableName}`);
      } else {
        console.log(`ℹ️  Table ${tableName} does not exist, skipping...`);
      }
    }

    console.log("\n✨ Done! Unused tables have been removed.");
    console.log("\n📋 Remaining tables:");
    const remainingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    remainingTables.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });
  } catch (error) {
    console.error("❌ Error removing tables:", error);
    throw error;
  }
}

// Run the script
removeUnusedTables()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

