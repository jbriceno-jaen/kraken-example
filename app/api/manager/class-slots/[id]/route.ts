import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { schedules, classSlots, reservations } from "@/src/db/schema";
import { eq, and, sql, ne } from "drizzle-orm";
import { authOptions } from "@/src/lib/auth";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

// PATCH - Update a class slot
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!(await isManager(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const slotId = parseInt(id);

    if (isNaN(slotId)) {
      return NextResponse.json(
        { error: "Invalid slot ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { day, time, capacity, available } = body;

    // Check if slot exists
    const existing = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, slotId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Schedule slot not found" },
        { status: 404 }
      );
    }

    const updateData: {
      updatedAt: Date;
      day?: string;
      time?: string;
      capacity?: number;
      available?: boolean;
    } = {
      updatedAt: new Date(),
    };

    // Update day if provided
    if (day !== undefined) {
      if (!days.includes(day)) {
        return NextResponse.json(
          { error: "Invalid day. Must be one of: " + days.join(", ") },
          { status: 400 }
        );
      }
      updateData.day = day;
    }

    // Update time if provided
    if (time !== undefined) {
      const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
      if (!timeRegex.test(time)) {
        return NextResponse.json(
          { error: "Invalid time format. Use format like '5:00 AM' or '5:00 PM'" },
          { status: 400 }
        );
      }
      updateData.time = time;
    }

    // Update capacity if provided
    if (capacity !== undefined) {
      const newCapacity = parseInt(capacity);
      if (isNaN(newCapacity) || newCapacity < 1) {
        return NextResponse.json(
          { error: "Capacity must be a positive number" },
          { status: 400 }
        );
      }
      updateData.capacity = newCapacity;
    }

    // Update available status if provided
    if (available !== undefined) {
      updateData.available = Boolean(available);
      // Debug: Log the update
      console.log('[API] Updating slot available status:', {
        slotId,
        availableValue: available,
        availableType: typeof available,
        convertedToBoolean: Boolean(available)
      });
    }

    // Check if updating day/time would create a duplicate
    if ((day !== undefined || time !== undefined) && (day !== existing[0].day || time !== existing[0].time)) {
      const newDay = day !== undefined ? day : existing[0].day;
      const newTime = time !== undefined ? time : existing[0].time;

      const duplicate = await db
        .select()
        .from(schedules)
        .where(
          and(
            eq(schedules.day, newDay),
            eq(schedules.time, newTime),
            ne(schedules.id, slotId)
          )
        )
        .limit(1);

      if (duplicate.length > 0) {
        return NextResponse.json(
          { error: "A schedule slot already exists for this day and time" },
          { status: 409 }
        );
      }
    }

    const updated = await db
      .update(schedules)
      .set(updateData)
      .where(eq(schedules.id, slotId))
      .returning();

    // Debug: Log what was saved to database
    console.log('[API] Slot updated in database:', {
      slotId: updated[0].id,
      day: updated[0].day,
      time: updated[0].time,
      available: updated[0].available,
      availableType: typeof updated[0].available
    });

    return NextResponse.json({ slot: updated[0] });
  } catch (error) {
    console.error("Error updating class slot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a class slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!(await isManager(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const slotId = parseInt(id);

    if (isNaN(slotId)) {
      return NextResponse.json(
        { error: "Invalid slot ID" },
        { status: 400 }
      );
    }

    // Check if slot exists
    const existing = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, slotId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Schedule slot not found" },
        { status: 404 }
      );
    }

    // Check if there are any reservations for this slot
    const reservationCount = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(reservations)
      .where(
        and(
          eq(reservations.day, existing[0].day),
          eq(reservations.time, existing[0].time)
        )
      );

    const hasReservations = Number(reservationCount[0]?.count || 0) > 0;

    if (hasReservations) {
      return NextResponse.json(
        { error: "Cannot delete schedule slot with existing reservations. Set it as unavailable instead." },
        { status: 400 }
      );
    }

    // Delete the slot
    await db.delete(schedules).where(eq(schedules.id, slotId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting class slot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

