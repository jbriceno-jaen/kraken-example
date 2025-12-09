import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { schedules, classSlots, reservations, classAttendees } from "@/src/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { authOptions } from "@/src/lib/auth";

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

// Helper to check if user is manager
async function isManager(session: { user?: { id?: string } } | null): Promise<boolean> {
  if (!session?.user?.id) return false;
  
  const { users } = await import("@/src/db/schema");
  const userId = parseInt(session.user.id);
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return user.length > 0 && user[0].role === "manager";
}

/**
 * Ensures ALL class slots exist in the database
 * Creates any missing slots (6 days × 8 times = 48 slots total)
 * This function is called on every GET request to guarantee all slots are configured
 */
async function ensureSlotsExist() {
  try {
    // Use schedules table as the main table
    const existingSlots = await db.select().from(schedules);
  
  // Create a set of existing day+time combinations for quick lookup
  const existingCombinations = new Set(
    existingSlots.map(slot => `${slot.day}|${slot.time}`)
  );
  
  // Generate ALL required slots (6 days × 8 times = 48 slots)
  // These are the standard slots that should ALWAYS exist
  const allRequiredSlots = days.flatMap((day) =>
    times.map((time) => ({
      day,
      time,
      capacity: 14,
      available: true,
    }))
  );
  
  // Find missing slots
  const missingSlots = allRequiredSlots.filter(
    slot => !existingCombinations.has(`${slot.day}|${slot.time}`)
  );
  
  // Insert missing slots if any
  // Use ON CONFLICT to handle race conditions gracefully
  if (missingSlots.length > 0) {
    try {
      // Insert with conflict handling (in case of unique constraint)
      for (const slot of missingSlots) {
        try {
          await db.insert(schedules).values(slot);
        } catch (error: any) {
          // If slot already exists (race condition), skip it
          if (error.code === '23505' || error.message?.includes('unique')) {
            continue;
          }
          throw error;
        }
      }
      console.log(`✅ Created ${missingSlots.length} missing schedule slots`);
    } catch (error: any) {
      console.error("Error creating missing slots:", error);
      // Don't throw - continue even if some slots couldn't be created
    }
  } else {
    console.log(`✅ All ${allRequiredSlots.length} schedule slots are configured`);
  }
  } catch (error: any) {
    // If schedules table doesn't exist, log error but don't crash
    if (error.message?.includes('does not exist') || error.code === '42P01') {
      console.error('❌ Schedules table does not exist. Run: npm run db:push');
      throw new Error('Schedules table not found. Please run database migration.');
    }
    throw error;
  }
}

// GET - Get all class slots
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!(await isManager(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ALWAYS ensure all slots exist before fetching
    // This guarantees all 48 slots (6 days × 8 times) are in the database
    await ensureSlotsExist();

    // Fetch all slots from schedules table
    let slots = await db.select().from(schedules);
    
    // Double-check: if we still don't have all slots, create them and fetch again
    const expectedSlotCount = days.length * times.length; // 6 × 8 = 48
    if (slots.length < expectedSlotCount) {
      console.log(`⚠️ Missing slots detected: ${slots.length}/${expectedSlotCount}, creating missing ones...`);
      await ensureSlotsExist();
      // Fetch again after ensuring
      slots = await db.select().from(schedules);
    }
    
    // Get reservation and class attendee counts for each slot
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
          console.log('[API /api/manager/class-slots] Processed slot (Monday 6:00 AM):', {
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

// POST - Create a new class slot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!(await isManager(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { day, time, capacity } = body;

    if (!day || !time) {
      return NextResponse.json(
        { error: "Day and time are required" },
        { status: 400 }
      );
    }

    if (!days.includes(day)) {
      return NextResponse.json(
        { error: "Invalid day. Must be one of: " + days.join(", ") },
        { status: 400 }
      );
    }

    // Validate time format (e.g., "5:00 AM" or "17:00")
    const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: "Invalid time format. Use format like '5:00 AM' or '5:00 PM'" },
        { status: 400 }
      );
    }

    // Check if slot already exists
    const existing = await db
      .select()
      .from(schedules)
      .where(
        and(
          eq(schedules.day, day),
          eq(schedules.time, time)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Schedule slot already exists for this day and time" },
        { status: 409 }
      );
    }

    const slotCapacity = capacity && capacity > 0 ? parseInt(capacity) : 14;

    const newSlot = await db
      .insert(schedules)
      .values({
        day,
        time,
        capacity: slotCapacity,
        available: true,
      })
      .returning();

    return NextResponse.json({ slot: newSlot[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating class slot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

