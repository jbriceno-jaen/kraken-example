import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { classSlots, reservations } from "@/src/db/schema";
import { eq, and, sql } from "drizzle-orm";

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const times = [
  "5:00 AM",
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
];

/**
 * Ensures all class slots exist in the database
 * This is called on first access to seed the slots
 */
async function ensureSlotsExist() {
  const existingSlots = await db.select().from(classSlots);
  
  if (existingSlots.length === 0) {
    // Create all slots with default capacity of 14
    const slotsToCreate = days.flatMap((day) =>
      times.map((time) => ({
        day,
        time,
        capacity: 14,
        available: true,
      }))
    );
    
    await db.insert(classSlots).values(slotsToCreate);
  } else {
    // Update any slots that have capacity != 14 to 14
    const slotsToUpdate = existingSlots.filter(slot => slot.capacity !== 14);
    if (slotsToUpdate.length > 0) {
      for (const slot of slotsToUpdate) {
        await db
          .update(classSlots)
          .set({ 
            capacity: 14,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(classSlots.day, slot.day),
              eq(classSlots.time, slot.time)
            )
          );
      }
    }
  }
}

export async function GET() {
  try {
    // Ensure slots exist in database
    await ensureSlotsExist();
    
    // Get all slots from database
    const slots = await db.select().from(classSlots);
    
    // Get reservation counts for each slot to check availability
    const slotsWithAvailability = await Promise.all(
      slots.map(async (slot) => {
        // Count reservations for this slot
        const reservationResults = await db
          .select({ count: sql<number>`count(*)`.as("count") })
          .from(reservations)
          .where(
            and(
              eq(reservations.day, slot.day),
              eq(reservations.time, slot.time)
            )
          );
        
        const currentReservations = Number(reservationResults[0]?.count || 0);
        const isAvailable = slot.available && currentReservations < slot.capacity;
        const spotsRemaining = Math.max(0, slot.capacity - currentReservations);
        
        return {
          id: slot.id,
          day: slot.day,
          time: slot.time,
          capacity: slot.capacity,
          available: isAvailable,
          spotsRemaining,
          currentReservations,
        };
      })
    );

    return NextResponse.json({ slots: slotsWithAvailability });
  } catch (error) {
    console.error("Error fetching class slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


