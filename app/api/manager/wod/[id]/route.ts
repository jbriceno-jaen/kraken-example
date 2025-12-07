import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { workoutOfDay, users } from "@/src/db/schema";
import { eq, and, gte, lte, ne } from "drizzle-orm";
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

// PUT - Update a WOD by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!(await isManager(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const wodId = parseInt(id);

    if (isNaN(wodId)) {
      return NextResponse.json(
        { error: "Invalid WOD ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { date, title, description } = body;

    if (!date || !title || !description) {
      return NextResponse.json(
        { error: "Date, title, and description are required" },
        { status: 400 }
      );
    }

    // Check if WOD exists
    const existing = await db
      .select()
      .from(workoutOfDay)
      .where(eq(workoutOfDay.id, wodId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "WOD not found" },
        { status: 404 }
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

    // Check if another WOD already exists for this date (excluding the current WOD)
    const startOfDay = new Date(wodDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(wodDate);
    endOfDay.setHours(23, 59, 59, 999);

    const duplicate = await db
      .select()
      .from(workoutOfDay)
      .where(
        and(
          gte(workoutOfDay.date, startOfDay),
          lte(workoutOfDay.date, endOfDay),
          ne(workoutOfDay.id, wodId) // Exclude the current WOD
        )
      )
      .limit(1);

    if (duplicate.length > 0) {
      return NextResponse.json(
        { error: "Ya existe un WOD para esta fecha. Solo se permite un WOD por día." },
        { status: 400 }
      );
    }

    // Update the WOD
    const updated = await db
      .update(workoutOfDay)
      .set({
        date: wodDate,
        title: title.trim(),
        description: description.trim(),
        updatedAt: new Date(),
      })
      .where(eq(workoutOfDay.id, wodId))
      .returning();

    return NextResponse.json({ wod: updated[0] });
  } catch (error) {
    console.error("Error updating WOD:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a WOD by ID
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
    const wodId = parseInt(id);

    if (isNaN(wodId)) {
      return NextResponse.json(
        { error: "Invalid WOD ID" },
        { status: 400 }
      );
    }

    // Check if WOD exists
    const existing = await db
      .select()
      .from(workoutOfDay)
      .where(eq(workoutOfDay.id, wodId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "WOD not found" },
        { status: 404 }
      );
    }

    // Delete the WOD
    await db
      .delete(workoutOfDay)
      .where(eq(workoutOfDay.id, wodId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting WOD:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

