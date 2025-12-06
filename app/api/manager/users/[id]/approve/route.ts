import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users, reservations } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { authOptions } from "@/src/lib/auth";

// Helper to check if user is manager
async function isManager(session: { user?: { id?: string } } | null): Promise<boolean> {
  if (!session?.user?.id) return false;
  
  const userId = parseInt(session.user.id);
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return user.length > 0 && user[0].role === "manager";
}

// PATCH - Approve or reject user
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
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const { approved } = body;

    if (typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "Approved must be a boolean" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't allow changing approval status of managers
    if (user[0].role === "manager") {
      return NextResponse.json(
        { error: "Cannot change approval status of managers" },
        { status: 400 }
      );
    }

    // If rejecting, delete all reservations for this user
    if (!approved) {
      await db.delete(reservations).where(eq(reservations.userId, userId));
    }

    // Update user approval status
    const updated = await db
      .update(users)
      .set({
        approved: approved,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        approved: users.approved,
        subscriptionExpires: users.subscriptionExpires,
        wodEnabled: users.wodEnabled,
        createdAt: users.createdAt,
      });

    return NextResponse.json({ 
      user: updated[0],
      message: approved 
        ? "Usuario aprobado exitosamente" 
        : "Usuario rechazado exitosamente. Todas sus reservas han sido canceladas."
    });
  } catch (error) {
    console.error("Error updating user approval:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

