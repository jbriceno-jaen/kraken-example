import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { schedules, classSlots, reservations, classAttendees } from "@/src/db/schema";
import { eq, and, sql } from "drizzle-orm";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
  // Use schedules table as the main table
  const existingSlots = await db.select().from(schedules);
  
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
    
    await db.insert(schedules).values(slotsToCreate);
  } else {
    // Update any slots that have capacity != 14 to 14
    const slotsToUpdate = existingSlots.filter(slot => slot.capacity !== 14);
    if (slotsToUpdate.length > 0) {
      for (const slot of slotsToUpdate) {
        await db
          .update(schedules)
          .set({ 
            capacity: 14,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(schedules.day, slot.day),
              eq(schedules.time, slot.time)
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
    
    // Get all slots from schedules table (main table)
    const slots = await db.select().from(schedules);
    
    // Debug: Log raw database values for Monday 6:00 AM
    const monday6amSlot = slots.find(s => s.day === 'Monday' && s.time === '6:00 AM');
    if (monday6amSlot) {
      console.log('[API /api/class-slots] Raw database slot (Monday 6:00 AM):', {
        id: monday6amSlot.id,
        day: monday6amSlot.day,
        time: monday6amSlot.time,
        available: monday6amSlot.available,
        availableType: typeof monday6amSlot.available
      });
    }
    
    // Get reservation and class attendee counts for each slot to check availability
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
        
        // Count class attendees (manager-added) for this slot
        const attendeeResults = await db
          .select({ count: sql<number>`count(*)`.as("count") })
          .from(classAttendees)
          .where(
            and(
              eq(classAttendees.day, slot.day),
              eq(classAttendees.time, slot.time)
            )
          );
        
        const currentReservations = Number(reservationResults[0]?.count || 0);
        const currentAttendees = Number(attendeeResults[0]?.count || 0);
        // Total occupied spots = reservations + manager-added attendees
        const totalOccupied = currentReservations + currentAttendees;
        // Keep the original available status from the slot, don't override it
        const spotsRemaining = Math.max(0, slot.capacity - totalOccupied);
        
        const slotData = {
          id: slot.id,
          day: slot.day,
          time: slot.time,
          capacity: slot.capacity,
          available: Boolean(slot.available), // Ensure boolean type
          spotsRemaining,
          currentReservations: totalOccupied, // Total occupied spots
        };
        
        // Debug: Log processed slot for Monday 6:00 AM
        if (slot.day === 'Monday' && slot.time === '6:00 AM') {
          console.log('[API /api/class-slots] Processed slot (Monday 6:00 AM):', {
            ...slotData,
            availableType: typeof slotData.available,
            rawAvailable: slot.available,
            rawAvailableType: typeof slot.available
          });
        }
        
        return slotData;
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


