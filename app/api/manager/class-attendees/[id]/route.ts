import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { classAttendees, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
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

// DELETE - Remove user from class
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
    const attendeeId = parseInt(id);

    if (isNaN(attendeeId)) {
      return NextResponse.json({ error: "Invalid attendee ID" }, { status: 400 });
    }

    // Check if attendee exists
    const attendee = await db
      .select()
      .from(classAttendees)
      .where(eq(classAttendees.id, attendeeId))
      .limit(1);

    if (attendee.length === 0) {
      return NextResponse.json({ error: "Attendee not found" }, { status: 404 });
    }

    // Delete attendee
    await db.delete(classAttendees).where(eq(classAttendees.id, attendeeId));

    return NextResponse.json({ message: "Attendee removed successfully" });
  } catch (error) {
    console.error("Error removing attendee:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

