import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { classSlots, reservations } from "@/src/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { authOptions } from "@/src/lib/auth";

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

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

// GET - Get all class slots
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!(await isManager(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slots = await db.select().from(classSlots);

    // Get reservation counts for each slot
    const slotsWithAvailability = await Promise.all(
      slots.map(async (slot) => {
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
        const spotsRemaining = Math.max(0, slot.capacity - currentReservations);
        
        return {
          id: slot.id,
          day: slot.day,
          time: slot.time,
          capacity: slot.capacity,
          available: slot.available,
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
      .from(classSlots)
      .where(
        and(
          eq(classSlots.day, day),
          eq(classSlots.time, time)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Class slot already exists for this day and time" },
        { status: 409 }
      );
    }

    const slotCapacity = capacity && capacity > 0 ? parseInt(capacity) : 14;

    const newSlot = await db
      .insert(classSlots)
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

