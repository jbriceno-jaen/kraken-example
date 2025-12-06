import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function testConnection() {
  console.log("Testing Neon DB connection...");
  console.log("Current directory:", process.cwd());
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set!");
    console.log("Looking for .env.local in:", process.cwd());
    process.exit(1);
  }
  
  console.log("✅ DATABASE_URL found");
  console.log("Connection string (masked):", databaseUrl.replace(/:[^:@]+@/, ":****@"));
  
  try {
    const sql = neon(databaseUrl);
    
    // Test with a simple query
    const result = await sql`SELECT version(), current_database(), current_user`;
    
    console.log("✅ Connection successful!");
    console.log("PostgreSQL version:", result[0].version);
    console.log("Database:", result[0].current_database);
    console.log("User:", result[0].current_user);
    
    // Test if we can query information_schema (checks permissions)
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5
    `;
    
    console.log("✅ Database permissions OK");
    console.log("Tables found:", tables.length > 0 ? tables.map((t: any) => t.table_name).join(", ") : "none");
    
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Connection failed!");
    console.error("Error:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    process.exit(1);
  }
}

testConnection();
