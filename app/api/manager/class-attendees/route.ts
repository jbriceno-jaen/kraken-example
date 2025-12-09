import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { classAttendees, users, reservations } from "@/src/db/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { authOptions } from "@/src/lib/auth";

// Helper to check if user is manager
async function isManager(session: any): Promise<boolean> {
  if (!session?.user?.id) return false;
  
  const userId = parseInt(session.user.id);
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return user.length > 0 && user[0].role === "manager";
}

// POST - Add user to a class/session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!(await isManager(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, day, time, date, reservationId } = body;

    if (!userId || !day || !time || !date) {
      return NextResponse.json(
        { error: "userId, day, time, and date are required" },
        { status: 400 }
      );
    }

    const targetUserId = parseInt(userId);
    const managerId = parseInt(session.user.id);
    
    // Parse date properly - handle YYYY-MM-DD format
    let classDate: Date;
    if (date.includes('T')) {
      classDate = new Date(date);
    } else {
      // For YYYY-MM-DD format, create date in local timezone
      const [year, month, day] = date.split('-').map(Number);
      classDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    console.log("[API] Adding attendee:", { userId: targetUserId, day, time, date, classDate: classDate.toISOString() });

    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already added
    const existing = await db
      .select()
      .from(classAttendees)
      .where(
        and(
          eq(classAttendees.userId, targetUserId),
          eq(classAttendees.day, day),
          eq(classAttendees.time, time),
          eq(classAttendees.date, classDate)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "User already added to this class" },
        { status: 409 }
      );
    }

    // Create class attendee
    const newAttendee = await db
      .insert(classAttendees)
      .values({
        userId: targetUserId,
        reservationId: reservationId ? parseInt(reservationId) : null,
        day,
        time,
        date: classDate,
        addedBy: managerId,
      })
      .returning();

    return NextResponse.json({ attendee: newAttendee[0] }, { status: 201 });
  } catch (error) {
    console.error("Error adding class attendee:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get attendees for a specific class (combines reservations and class attendees)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!(await isManager(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day");
    const time = searchParams.get("time"); // Optional - if not provided, get all attendees for the day
    const date = searchParams.get("date");

    if (!day || !date) {
      return NextResponse.json(
        { error: "day and date are required" },
        { status: 400 }
      );
    }

    // Parse and normalize the date
    // The date comes as YYYY-MM-DD, but reservations are stored with specific times
    // We need to compare only the date part, ignoring the time
    let classDate: Date;
    let endDate: Date;
    
    if (date.includes('T')) {
      classDate = new Date(date);
      classDate.setHours(0, 0, 0, 0);
      endDate = new Date(classDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // If it's just a date string (YYYY-MM-DD), parse it in local timezone
      classDate = new Date(date);
      classDate.setHours(0, 0, 0, 0);
      endDate = new Date(classDate);
      endDate.setHours(23, 59, 59, 999);
    }

    console.log("[API] Fetching attendees for:", { 
      day, 
      time, 
      date, 
      classDate: classDate.toISOString(), 
      endDate: endDate.toISOString(),
      classDateLocal: classDate.toString(),
      endDateLocal: endDate.toString()
    });

    // Build where conditions - time is optional
    // Compare dates by truncating time part - this handles dates stored with specific times
    // Use date range that covers the entire day (from 00:00:00 to 23:59:59)
    const dateOnly = date.split('T')[0]; // Get just YYYY-MM-DD part
    
    // Create start and end of day in local timezone
    const startOfDay = new Date(dateOnly + 'T00:00:00');
    const endOfDay = new Date(dateOnly + 'T23:59:59.999');
    
    const managerWhereConditions = [
      eq(classAttendees.day, day),
      gte(classAttendees.date, startOfDay),
      lte(classAttendees.date, endOfDay)
    ];
    
    const reservationWhereConditions = [
      eq(reservations.day, day),
      gte(reservations.date, startOfDay),
      lte(reservations.date, endOfDay)
    ];

    // Add time filter if provided
    if (time) {
      managerWhereConditions.push(eq(classAttendees.time, time));
      reservationWhereConditions.push(eq(reservations.time, time));
    }

    // Debug logging (only in development)
    if (process.env.NODE_ENV === "development") {
      const allDayAttendeesDebug = await db
        .select({ day: classAttendees.day, count: sql<number>`count(*)`.as("count") })
        .from(classAttendees)
        .where(eq(classAttendees.day, day))
        .groupBy(classAttendees.day);
      
      const allDayReservationsDebug = await db
        .select({ day: reservations.day, count: sql<number>`count(*)`.as("count") })
        .from(reservations)
        .where(eq(reservations.day, day))
        .groupBy(reservations.day);
      
      console.log("[API] Debug - All attendees for day (no date filter):", allDayAttendeesDebug);
      console.log("[API] Debug - All reservations for day (no date filter):", allDayReservationsDebug);
    }

    // Get class attendees (added by manager) - match by day, optional time, and date range
    const attendeesFromManager = await db
      .select({
        id: classAttendees.id,
        userId: classAttendees.userId,
        userName: users.name,
        userEmail: users.email,
        day: classAttendees.day,
        time: classAttendees.time,
        date: classAttendees.date,
        addedBy: classAttendees.addedBy,
        createdAt: classAttendees.createdAt,
      })
      .from(classAttendees)
      .innerJoin(users, eq(classAttendees.userId, users.id))
      .where(and(...managerWhereConditions));

    // Get reservations (made by clients) - match by day, optional time, and date range
    const reservationsData = await db
      .select({
        id: reservations.id,
        userId: reservations.userId,
        userName: users.name,
        userEmail: users.email,
        day: reservations.day,
        time: reservations.time,
        date: reservations.date,
        createdAt: reservations.createdAt,
      })
      .from(reservations)
      .innerJoin(users, eq(reservations.userId, users.id))
      .where(and(...reservationWhereConditions));
    
    console.log("[API] Raw query results:", {
      attendeesFromManager: attendeesFromManager.length,
      reservationsData: reservationsData.length,
      sampleAttendee: attendeesFromManager[0],
      sampleReservation: reservationsData[0]
    });

    // Combine both lists, avoiding duplicates (if a user has both a reservation and was added by manager, show only the manager-added one)
    const attendeeUserIds = new Set(attendeesFromManager.map(a => a.userId));
    const uniqueReservations = reservationsData.filter(r => !attendeeUserIds.has(r.userId));

    // Format attendees from manager to include source
    const formattedManagerAttendees = attendeesFromManager.map(a => ({
      id: a.id,
      userId: a.userId,
      userName: a.userName,
      userEmail: a.userEmail,
      day: a.day,
      time: a.time,
      date: a.date instanceof Date ? a.date.toISOString() : a.date,
      addedBy: a.addedBy,
      createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
      source: 'manager' as string,
    }));

    // Format reservations to match attendee structure
    const formattedReservations = uniqueReservations.map(r => ({
      id: r.id,
      userId: r.userId,
      userName: r.userName,
      userEmail: r.userEmail,
      day: r.day,
      time: r.time,
      date: r.date instanceof Date ? r.date.toISOString() : r.date,
      addedBy: null,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      source: 'reservation' as string,
    }));

    // Combine both lists
    const allAttendees = [...formattedManagerAttendees, ...formattedReservations];

    console.log("[API] Found attendees:", {
      fromManager: attendeesFromManager.length,
      fromReservations: reservationsData.length,
      uniqueReservations: uniqueReservations.length,
      total: allAttendees.length,
      sample: allAttendees.slice(0, 3),
      allTimes: allAttendees.map(a => a.time),
      uniqueTimes: [...new Set(allAttendees.map(a => a.time))]
    });

    return NextResponse.json({ attendees: allAttendees });
  } catch (error) {
    console.error("Error fetching class attendees:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

