/**
 * Script to verify a user's password in the database
 * 
 * This script helps debug login issues by checking if a user exists
 * and verifying their password hash.
 * 
 * Run with: tsx scripts/db/verify-user-password.ts <email>
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

async function verifyUserPassword(email: string) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = neon(databaseUrl);

  const normalizedEmail = email.trim().toLowerCase();

  console.log(`🔍 Checking user: ${normalizedEmail}\n`);

  try {
    // Check if user exists
    const user = await sql`
      SELECT id, name, email, password, role
      FROM users 
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `;

    if (user.length === 0) {
      console.log("❌ User not found in database");
      return;
    }

    const userData = user[0];
    console.log("✅ User found:");
    console.log(`   ID: ${userData.id}`);
    console.log(`   Name: ${userData.name}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role: ${userData.role || "client"}`);
    console.log(`   Has password: ${!!userData.password}`);

    if (userData.password) {
      console.log(`   Password hash (first 30 chars): ${userData.password.substring(0, 30)}...`);
      console.log(`   Password hash length: ${userData.password.length}`);
      
      // Check if it's a valid bcrypt hash
      const isBcryptHash = userData.password.startsWith("$2a$") || 
                          userData.password.startsWith("$2b$") || 
                          userData.password.startsWith("$2y$");
      console.log(`   Valid bcrypt hash: ${isBcryptHash}`);
      
      if (!isBcryptHash) {
        console.log("\n⚠️  WARNING: Password is not a valid bcrypt hash!");
        console.log("   The password needs to be hashed with bcrypt before storing.");
      }
    } else {
      console.log("\n⚠️  WARNING: User has no password set!");
      console.log("   You need to set a password for this user.");
    }

    console.log("\n💡 To test a password, you can use:");
    console.log(`   const isValid = await bcrypt.compare("your-password", "${userData.password?.substring(0, 30)}...");`);

  } catch (error) {
    console.error("❌ Error checking user:", error);
    throw error;
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("\nUsage: tsx scripts/db/verify-user-password.ts <email>");
  process.exit(1);
}

verifyUserPassword(email)
  .then(() => {
    console.log("\n✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

