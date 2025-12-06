import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { reservations, classSlots } from "@/src/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getOrCreateUser } from "@/src/lib/server/user";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userReservations = await db
      .select()
      .from(reservations)
      .where(eq(reservations.clerkId, userId))
      .orderBy(reservations.date);

    return NextResponse.json({ reservations: userReservations });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { day, time } = body;

    if (!day || !time) {
      return NextResponse.json(
        { error: "Day and time are required" },
        { status: 400 }
      );
    }

    // Check if reservation already exists
    const existing = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.clerkId, userId),
          eq(reservations.day, day),
          eq(reservations.time, time)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Reservation already exists" },
        { status: 409 }
      );
    }

    // Check if slot exists and get capacity
    const slot = await db
      .select()
      .from(classSlots)
      .where(
        and(
          eq(classSlots.day, day),
          eq(classSlots.time, time)
        )
      )
      .limit(1);

    // If slot doesn't exist, create it with default capacity of 14
    let slotCapacity = 14;
    if (slot.length > 0) {
      slotCapacity = slot[0].capacity;
      if (!slot[0].available) {
        return NextResponse.json(
          { error: "This time slot is not available" },
          { status: 400 }
        );
      }
    } else {
      // Create the slot if it doesn't exist
      await db.insert(classSlots).values({
        day,
        time,
        capacity: 14,
        available: true,
      });
    }

    // Check current reservation count for this slot
    const reservationCount = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(reservations)
      .where(
        and(
          eq(reservations.day, day),
          eq(reservations.time, time)
        )
      );

    const currentCount = Number(reservationCount[0]?.count || 0);

    // Check if slot is full
    if (currentCount >= slotCapacity) {
      return NextResponse.json(
        { error: `This time slot is full (${currentCount}/${slotCapacity} people)` },
        { status: 400 }
      );
    }

    // Get or create user record first
    const user = await getOrCreateUser(userId);
    
    // Calculate date from day and time
    const date = calculateDate(day, time);

    const newReservation = await db
      .insert(reservations)
      .values({
        clerkId: userId,
        userId: user.id, // Properly linked to user table
        day,
        time,
        date,
      })
      .returning();

    return NextResponse.json(
      { reservation: newReservation[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateDate(day: string, time: string): Date {
  const dayMap: Record<string, number> = {
    Lunes: 1,
    Martes: 2,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sábado: 6,
  };

  const today = new Date();
  const currentDay = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday (0) to 7
  const targetDay = dayMap[day] || 1;

  let daysToAdd = targetDay - currentDay;
  if (daysToAdd < 0) {
    daysToAdd += 7; // Next week
  }

  const date = new Date(today);
  date.setDate(today.getDate() + daysToAdd);

  // Parse time (e.g., "5:00 AM" -> 5:00)
  const [timeStr, period] = time.split(" ");
  const [hours, minutes] = timeStr.split(":").map(Number);
  let hour24 = hours;
  if (period === "PM" && hours !== 12) hour24 += 12;
  if (period === "AM" && hours === 12) hour24 = 0;

  date.setHours(hour24, minutes || 0, 0, 0);

  return date;
}


