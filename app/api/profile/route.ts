import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { profiles, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateUser } from "@/src/lib/server/user";
import { authOptions } from "@/src/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    
    // Ensure user exists in database
    const user = await getOrCreateUser(userId);
    const userEmail = user.email;

    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ 
        profile: null,
        userEmail: userEmail 
      });
    }

    // Return profile with user email from users table (read-only)
    return NextResponse.json({ 
      profile: {
        ...profile[0],
        userEmail: userEmail // Email from login, read-only
      },
      userEmail: userEmail
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const body = await request.json();
    const { name, phone, goals, dateOfBirth } = body;
    // Don't allow email to be updated - it comes from the users table
    
    // Calculate age from dateOfBirth
    let calculatedAge: number | null = null;
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      calculatedAge = age;
    }

    // Ensure user exists
    const user = await getOrCreateUser(userId);
    
    // Check if profile exists
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    const userEmail = user.email;

    if (existing.length > 0) {
      // Update existing profile (don't update email - it comes from users table)
      const updated = await db
        .update(profiles)
        .set({
          name,
          email: userEmail, // Keep email from users table
          phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          goals,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId))
        .returning();

      // Update age in users table if dateOfBirth was provided
      if (calculatedAge !== null) {
        await db
          .update(users)
          .set({
            age: calculatedAge,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }

      return NextResponse.json({ profile: updated[0] });
    } else {
      // Create new profile (use email from users table, not from request)
      const newProfile = await db
        .insert(profiles)
        .values({
          userId: user.id, // Properly linked to user table
          name,
          email: user.email, // Use email from users table
          phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          goals,
        })
        .returning();

      // Update age in users table if dateOfBirth was provided
      if (calculatedAge !== null) {
        await db
          .update(users)
          .set({
            age: calculatedAge,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }

      return NextResponse.json({ profile: newProfile[0] }, { status: 201 });
    }
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


