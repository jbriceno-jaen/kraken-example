// IMPORTANT: dotenv/config must be imported FIRST before any other imports
import "dotenv/config";

import { db } from "../../src/db";
import { classSlots } from "../../src/db/schema";
import { sql } from "drizzle-orm";

async function updateSlotCapacity() {
  console.log("🔄 Updating class slot capacity to 14...\n");

  try {
    // Update all slots to have capacity of 14
    const result = await db
      .update(classSlots)
      .set({ 
        capacity: 14,
        updatedAt: new Date(),
      })
      .where(sql`1 = 1`); // Update all rows

    console.log("✅ Successfully updated all class slots to capacity 14");
    console.log("   All slots now have a maximum of 14 people per time slot\n");

    // Verify the update
    const slots = await db.select().from(classSlots);
    const capacityCounts = slots.reduce((acc, slot) => {
      acc[slot.capacity] = (acc[slot.capacity] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log("📊 Capacity distribution:");
    Object.entries(capacityCounts).forEach(([capacity, count]) => {
      console.log(`   ${count} slots with capacity ${capacity}`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error updating slot capacity:");
    console.error("   Message:", error.message);
    if (error.code) {
      console.error("   Code:", error.code);
    }
    process.exit(1);
  }
}

updateSlotCapacity();
