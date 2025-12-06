// IMPORTANT: dotenv/config must be imported FIRST before any other imports
import "dotenv/config";

import { db } from "../../src/db";
import { users, profiles, personalRecords, reservations, classSlots } from "../../src/db/schema";
import { eq } from "drizzle-orm";

async function verifyConnection() {
  console.log("🔍 Verifying database connection and data...\n");

  try {
    // Test 1: Check users
    console.log("📊 Checking Users Table...");
    const userCount = await db.select().from(users);
    console.log(`   Found ${userCount.length} users`);
    if (userCount.length > 0) {
      console.log("   Sample users:");
      userCount.slice(0, 3).forEach((user) => {
        console.log(`     - ${user.name} (${user.email}) - Clerk ID: ${user.clerkId}`);
      });
    }
    console.log("");

    // Test 2: Check profiles
    console.log("👤 Checking Profiles Table...");
    const profileCount = await db.select().from(profiles);
    console.log(`   Found ${profileCount.length} profiles`);
    if (profileCount.length > 0) {
      console.log("   Sample profiles:");
      profileCount.slice(0, 3).forEach((profile) => {
        console.log(`     - ${profile.name || "No name"} (${profile.email || "No email"})`);
        if (profile.goals) {
          console.log(`       Goals: ${profile.goals.substring(0, 50)}...`);
        }
      });
    }
    console.log("");

    // Test 3: Check personal records
    console.log("🏋️ Checking Personal Records Table...");
    const prCount = await db.select().from(personalRecords);
    console.log(`   Found ${prCount.length} personal records`);
    if (prCount.length > 0) {
      console.log("   Sample PRs:");
      prCount.slice(0, 5).forEach((pr) => {
        console.log(`     - ${pr.exercise}: ${pr.weight}`);
      });
    }
    console.log("");

    // Test 4: Check reservations
    console.log("📅 Checking Reservations Table...");
    const reservationCount = await db.select().from(reservations);
    console.log(`   Found ${reservationCount.length} reservations`);
    if (reservationCount.length > 0) {
      console.log("   Sample reservations:");
      reservationCount.slice(0, 5).forEach((res) => {
        const date = new Date(res.date);
        console.log(`     - ${res.day} ${res.time} (${date.toLocaleDateString()})`);
      });
    }
    console.log("");

    // Test 5: Check class slots
    console.log("⏰ Checking Class Slots Table...");
    const slotCount = await db.select().from(classSlots);
    console.log(`   Found ${slotCount.length} class slots`);
    if (slotCount.length > 0) {
      console.log("   Sample slots:");
      slotCount.slice(0, 5).forEach((slot) => {
        console.log(`     - ${slot.day} ${slot.time} (Capacity: ${slot.capacity}, Available: ${slot.available})`);
      });
    }
    console.log("");

    // Test 6: Test a simple query with joins
    console.log("🔗 Testing Relationships...");
    const usersWithProfiles = await db
      .select({
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        profileName: profiles.name,
        profileGoals: profiles.goals,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .limit(5);

    console.log(`   Found ${usersWithProfiles.length} users (with/without profiles)`);
    if (usersWithProfiles.length > 0) {
      usersWithProfiles.forEach((row) => {
        console.log(`     - ${row.userName} (${row.userEmail})`);
        if (row.profileName) {
          console.log(`       Profile: ${row.profileName}`);
        }
      });
    }
    console.log("");

    // Summary
    console.log("✅ Connection Summary:");
    console.log(`   Users: ${userCount.length}`);
    console.log(`   Profiles: ${profileCount.length}`);
    console.log(`   Personal Records: ${prCount.length}`);
    console.log(`   Reservations: ${reservationCount.length}`);
    console.log(`   Class Slots: ${slotCount.length}`);
    console.log("\n🎉 Database connection is working correctly!");
    console.log("\n💡 To see data, use the app and:");
    console.log("   1. Sign in with Clerk");
    console.log("   2. Create a profile");
    console.log("   3. Add personal records");
    console.log("   4. Make reservations");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error verifying connection:");
    console.error("   Message:", error.message);
    if (error.code) {
      console.error("   Code:", error.code);
    }
    if (error.stack) {
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  }
}

verifyConnection();
