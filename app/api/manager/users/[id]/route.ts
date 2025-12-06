import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users, reservations } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
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

// DELETE - Remove user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!(await isManager(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Don't allow deleting yourself
    const currentUserId = parseInt(session.user.id);
    if (userId === currentUserId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
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

    // Delete all reservations for this user first
    await db.delete(reservations).where(eq(reservations.userId, userId));

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ 
      message: "Usuario eliminado exitosamente. Todas sus reservas han sido canceladas."
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update user (subscription, WOD, role, etc.)
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
    const { name, email, subscriptionDays, wodEnabled, role, password, approved } = body;

    // Check if user exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    // Update name
    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    // Update email
    if (email && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      // Check if email is already taken by another user
      const emailCheck = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);
      
      if (emailCheck.length > 0 && emailCheck[0].id !== userId) {
        return NextResponse.json(
          { error: "Email already in use by another user" },
          { status: 409 }
        );
      }
      updateData.email = normalizedEmail;
    }

    // Update subscription
    // If subscriptionDays is provided, calculate end date from current date + days
    // If subscriptionDays is 0 or null, clear the subscription
    if (subscriptionDays !== undefined) {
      if (subscriptionDays === null || subscriptionDays === "" || subscriptionDays === 0) {
        updateData.subscriptionExpires = null;
      } else {
        const days = parseInt(subscriptionDays);
        if (days > 0) {
          // Calculate end date from today + days
          const subscriptionExpires = new Date();
          subscriptionExpires.setHours(23, 59, 59, 999); // Set to end of day
          subscriptionExpires.setDate(subscriptionExpires.getDate() + days);
          updateData.subscriptionExpires = subscriptionExpires;
        } else {
          updateData.subscriptionExpires = null;
        }
      }
    }

    // Update WOD enabled
    if (wodEnabled !== undefined) {
      updateData.wodEnabled = wodEnabled;
    }

    // Update role
    if (role && (role === "client" || role === "manager")) {
      updateData.role = role;
      // Managers are always approved
      if (role === "manager") {
        updateData.approved = true;
      }
    }

    // Update approval status (only for clients)
    // If changing role to manager, automatically approve
    if (role === "manager") {
      updateData.approved = true;
    } else if (approved !== undefined && user[0].role === "client") {
      updateData.approved = approved;
      // If rejecting, delete all reservations
      if (!approved) {
        await db.delete(reservations).where(eq(reservations.userId, userId));
      }
    }

    // Update password
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    updateData.updatedAt = new Date();

    // Update user
    const updated = await db
      .update(users)
      .set(updateData)
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

    return NextResponse.json({ user: updated[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

