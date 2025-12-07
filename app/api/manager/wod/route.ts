import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { workoutOfDay, users } from "@/src/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
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

// GET - Get WOD for a specific date or today
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    let targetDate: Date;
    if (dateParam) {
      // Parse date in local timezone to avoid timezone shift issues
      // Handle YYYY-MM-DD format (from formatDateLocal)
      if (dateParam.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = dateParam.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(parts[2], 10);
        targetDate = new Date(year, month, day, 0, 0, 0, 0);
      } else {
        // Handle ISO strings
        const tempDate = new Date(dateParam);
        targetDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), 0, 0, 0, 0);
      }
    } else {
      targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
    }

    // Get start and end of day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const wod = await db
      .select()
      .from(workoutOfDay)
      .where(
        and(
          gte(workoutOfDay.date, startOfDay),
          lte(workoutOfDay.date, endOfDay)
        )
      )
      .limit(1);

    if (wod.length === 0) {
      return NextResponse.json({ wod: null });
    }

    return NextResponse.json({ wod: wod[0] });
  } catch (error) {
    console.error("Error fetching WOD:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create or update WOD
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
    const { date, title, description } = body;

    if (!date || !title || !description) {
      return NextResponse.json(
        { error: "Date, title, and description are required" },
        { status: 400 }
      );
    }

    // Parse date in local timezone to avoid timezone shift issues
    // Handle YYYY-MM-DD format (from formatDateLocal)
    let wodDate: Date;
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = date.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[2], 10);
      wodDate = new Date(year, month, day, 0, 0, 0, 0);
    } else {
      // Handle ISO strings or Date objects
      const tempDate = new Date(date);
      wodDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), 0, 0, 0, 0);
    }

    const managerId = parseInt(session.user.id);

    // Check if WOD already exists for this date
    const startOfDay = new Date(wodDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(wodDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await db
      .select()
      .from(workoutOfDay)
      .where(
        and(
          gte(workoutOfDay.date, startOfDay),
          lte(workoutOfDay.date, endOfDay)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // WOD already exists for this date - return error
      return NextResponse.json(
        { error: "Ya existe un WOD para esta fecha. Solo se permite un WOD por día. Usa el botón 'Actualizar' para modificar un WOD existente." },
        { status: 400 }
      );
    }

    // Create new WOD
    const newWod = await db
      .insert(workoutOfDay)
      .values({
        date: wodDate,
        title: title.trim(),
        description: description.trim(),
        createdBy: managerId,
      })
      .returning();

    return NextResponse.json({ wod: newWod[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating WOD:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

