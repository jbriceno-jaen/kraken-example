import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
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

// GET - List all users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!(await isManager(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        approved: users.approved,
        subscriptionExpires: users.subscriptionExpires,
        wodEnabled: users.wodEnabled,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!(await isManager(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role, subscriptionDays, wodEnabled } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate subscription expiration date
    // End date is calculated from current date + subscription days
    let subscriptionExpires: Date | null = null;
    if (subscriptionDays && subscriptionDays > 0) {
      subscriptionExpires = new Date();
      subscriptionExpires.setHours(23, 59, 59, 999); // Set to end of day
      subscriptionExpires.setDate(subscriptionExpires.getDate() + subscriptionDays);
    }

    // Create user
    // Users created by manager are always approved
    const userRole = role || "client";
    const newUser = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: userRole,
        approved: true, // Manager-created users are always approved
        subscriptionExpires: subscriptionExpires,
        wodEnabled: wodEnabled || false,
      })
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

    return NextResponse.json({ user: newUser[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

