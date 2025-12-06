import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { reservations, users } from "@/src/db/schema";
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

// DELETE - Remove reservation (manager only)
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
    const reservationId = parseInt(id);

    if (isNaN(reservationId)) {
      return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 });
    }

    // Check if reservation exists
    const existing = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    // Delete reservation
    await db.delete(reservations).where(eq(reservations.id, reservationId));

    return NextResponse.json({ message: "Reservation removed successfully" });
  } catch (error) {
    console.error("Error removing reservation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

