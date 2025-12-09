import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { reservations, schedules, classSlots, classAttendees } from "@/src/db/schema";
import { eq, and, sql, gte } from "drizzle-orm";
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

    // Get all class attendees (manager-added) for the user
    const allClassAttendees = await db
      .select()
      .from(classAttendees)
      .where(eq(classAttendees.userId, user.id))
      .orderBy(classAttendees.date);

    // Filter out past reservations (only keep current week and future)
    const activeReservations = allReservations.filter((reservation) => {
      const reservationDate = new Date(reservation.date);
      return reservationDate >= startOfWeek;
    });

    // Filter out past class attendees (only keep current week and future)
    const activeClassAttendees = allClassAttendees.filter((attendee) => {
      const attendeeDate = new Date(attendee.date);
      return attendeeDate >= startOfWeek;
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

    // Format class attendees to match reservation structure
    const formattedClassAttendees = activeClassAttendees.map((attendee) => ({
      id: attendee.id,
      userId: attendee.userId,
      day: attendee.day,
      time: attendee.time,
      date: attendee.date instanceof Date ? attendee.date.toISOString() : attendee.date,
      createdAt: attendee.createdAt instanceof Date ? attendee.createdAt.toISOString() : attendee.createdAt,
      source: 'manager', // Mark as manager-added
    }));

    // Format reservations to include source
    const formattedReservations = activeReservations.map((reservation) => ({
      ...reservation,
      date: reservation.date instanceof Date ? reservation.date.toISOString() : reservation.date,
      createdAt: reservation.createdAt instanceof Date ? reservation.createdAt.toISOString() : reservation.createdAt,
      source: 'reservation', // Mark as client-made reservation
    }));

    // Combine both lists - manager-added attendees take precedence if there's a duplicate
    // (If user has both a reservation and was added by manager for the same slot, show manager-added)
    const attendeeMap = new Map();
    
    // First add all manager-added attendees
    formattedClassAttendees.forEach((attendee) => {
      const key = `${attendee.day}-${attendee.time}-${attendee.date}`;
      attendeeMap.set(key, attendee);
    });
    
    // Then add reservations that don't conflict with manager-added
    formattedReservations.forEach((reservation) => {
      const key = `${reservation.day}-${reservation.time}-${reservation.date}`;
      if (!attendeeMap.has(key)) {
        attendeeMap.set(key, reservation);
      }
    });

    // Convert map back to array and sort by date
    const allBookings = Array.from(attendeeMap.values()).sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    return NextResponse.json({ reservations: allBookings });
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
        { error: "Your account is pending approval. Please wait for the administrator to approve your account." },
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

    // Check if slot exists and get capacity from schedules table
    const slot = await db
      .select()
      .from(schedules)
      .where(
        and(
          eq(schedules.day, day),
          eq(schedules.time, time)
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
      // Create the slot if it doesn't exist in schedules table
      await db.insert(schedules).values({
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


