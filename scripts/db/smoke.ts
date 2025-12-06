// IMPORTANT: dotenv/config must be imported FIRST before any other imports
// This ensures DATABASE_URL is loaded before the database client initializes
import "dotenv/config";

import { eq } from "drizzle-orm";
import { db } from "../../src/db/client";
import { users } from "../../src/db/schema";

async function main() {
  console.log("🧪 Testing Neon DB connection...");
  console.log("📁 Working directory:", process.cwd());
  
  // Check if DATABASE_URL is set
  const hasDbUrl = !!process.env.DATABASE_URL;
  console.log("🔑 DATABASE_URL:", hasDbUrl ? "✅ Set" : "❌ Not set");
  
  if (hasDbUrl) {
    const masked = process.env.DATABASE_URL!.replace(/:[^:@]+@/, ":****@");
    console.log("🔗 Connection string:", masked.substring(0, 60) + "...");
  } else {
    console.error("\n❌ DATABASE_URL is not set!");
    console.error("Please check your .env.local file in the project root.");
    process.exit(1);
  }

  try {
    const email = `drizzle-smoke-${Date.now()}@example.com`;
    console.log("\n📝 Inserting test record...");
    console.log("   Email:", email);

    const insertResult = await db.insert(users).values({ 
      name: "Drizzle Smoke Test", 
      age: 1, 
      email 
    });
    console.log("✅ Insert successful");

    console.log("🔍 Reading test record...");
    const [row] = await db.select().from(users).where(eq(users.email, email));
    
    if (!row) {
      throw new Error("Failed to read inserted record");
    }
    
    console.log("✅ Read successful");
    console.log("   Record:", JSON.stringify(row, null, 2));

    console.log("🗑️  Cleaning up...");
    const deleteResult = await db.delete(users).where(eq(users.email, email));
    console.log("✅ Cleanup complete");
    
    console.log("\n🎉 All tests passed! Database connection is working.");
    console.log("✅ Connection is stable and ready for use.");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Test failed!");
    console.error("Error message:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.cause) {
      console.error("Error cause:", error.cause);
    }
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
