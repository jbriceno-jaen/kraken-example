import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        approved: users.approved,
        role: users.role,
        subscriptionExpires: users.subscriptionExpires,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if subscription is expired (only for clients)
    let subscriptionExpired = false;
    if (user[0].role === "client" && user[0].subscriptionExpires) {
      const now = new Date();
      const expirationDate = new Date(user[0].subscriptionExpires);
      expirationDate.setHours(23, 59, 59, 999);
      subscriptionExpired = now > expirationDate;
    }

    return NextResponse.json({
      approved: user[0].approved,
      role: user[0].role,
      subscriptionExpired: subscriptionExpired,
      subscriptionExpires: user[0].subscriptionExpires?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error checking approval:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

