import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { reservations, classSlots } from "@/src/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getOrCreateUser } from "@/src/lib/server/user";
import { authOptions } from "@/src/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const user = await getOrCreateUser(userId);

    const now = new Date();
    // Get start of current week (Monday)
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get all reservations for the user
    const allReservations = await db
      .select()
      .from(reservations)
      .where(eq(reservations.userId, user.id))
      .orderBy(reservations.date);

    // Filter out past reservations (only keep current week and future)
    const activeReservations = allReservations.filter((reservation) => {
      const reservationDate = new Date(reservation.date);
      return reservationDate >= startOfWeek;
    });

    // Delete old reservations (past week) in the background
    const oldReservations = allReservations.filter((reservation) => {
      const reservationDate = new Date(reservation.date);
      return reservationDate < startOfWeek;
    });

    if (oldReservations.length > 0) {
      // Delete old reservations asynchronously
      Promise.all(
        oldReservations.map((oldRes) =>
          db.delete(reservations).where(eq(reservations.id, oldRes.id))
        )
      ).catch((error) => {
        console.error("Error deleting old reservations:", error);
      });
    }

    return NextResponse.json({ reservations: activeReservations });
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const user = await getOrCreateUser(userId);

    // Check if user is approved (managers are always approved)
    if (user.role === "client" && !user.approved) {
      return NextResponse.json(
        { error: "Tu cuenta está pendiente de aprobación. Por favor espera a que el administrador apruebe tu cuenta." },
        { status: 403 }
      );
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
          eq(reservations.userId, user.id),
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

    // Calculate date from day and time
    const date = calculateDate(day, time);

    const newReservation = await db
      .insert(reservations)
      .values({
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


