/**
 * Script to generate a bcrypt hash for a password
 * 
 * Run with: tsx scripts/db/hash-password.ts <password>
 */

import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("❌ Please provide a password");
  console.log("\nUsage: tsx scripts/db/hash-password.ts <password>");
  process.exit(1);
}

async function hashPassword() {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("\n✅ Password hash generated:");
  console.log(hashedPassword);
  console.log("\n💡 Use this hash when creating/updating users in the database");
  console.log("\nExample SQL:");
  console.log(`UPDATE users SET password = '${hashedPassword}' WHERE email = 'your-email@example.com';`);
}

hashPassword()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

