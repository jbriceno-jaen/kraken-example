import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { personalRecords } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateUser } from "@/src/lib/server/user";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await db
      .select()
      .from(personalRecords)
      .where(eq(personalRecords.clerkId, userId))
      .orderBy(personalRecords.createdAt);

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error fetching personal records:", error);
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
    const { exercise, weight } = body;

    if (!exercise || !weight) {
      return NextResponse.json(
        { error: "Exercise and weight are required" },
        { status: 400 }
      );
    }

    // Get or create user record first
    const user = await getOrCreateUser(userId);

    const newRecord = await db
      .insert(personalRecords)
      .values({
        clerkId: userId,
        userId: user.id, // Properly linked to user table
        exercise: exercise.trim(),
        weight: weight.trim(),
      })
      .returning();

    return NextResponse.json({ record: newRecord[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating personal record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


