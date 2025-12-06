import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { profiles, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateUser } from "@/src/lib/server/user";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.clerkId, userId))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile: profile[0] });
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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, goals } = body;

    // Check if profile exists
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.clerkId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing profile
      const updated = await db
        .update(profiles)
        .set({
          name,
          email,
          phone,
          goals,
          updatedAt: new Date(),
        })
        .where(eq(profiles.clerkId, userId))
        .returning();

      return NextResponse.json({ profile: updated[0] });
    } else {
      // Get or create user record first
      const user = await getOrCreateUser(userId);
      
      // Create new profile
      const newProfile = await db
        .insert(profiles)
        .values({
          clerkId: userId,
          userId: user.id, // Properly linked to user table
          name,
          email,
          phone,
          goals,
        })
        .returning();

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


