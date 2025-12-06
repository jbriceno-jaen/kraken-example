import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { reservations } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { getOrCreateUser } from "@/src/lib/server/user";
import { authOptions } from "@/src/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const user = await getOrCreateUser(userId);

    const { id } = await params;
    const reservationId = parseInt(id);

    if (isNaN(reservationId)) {
      return NextResponse.json({ error: "Invalid reservation ID" }, { status: 400 });
    }

    // Check if reservation exists and belongs to user
    const existing = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.userId, user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    await db
      .delete(reservations)
      .where(
        and(
          eq(reservations.id, reservationId),
          eq(reservations.userId, user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
