import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { personalRecords } from "@/src/db/schema";
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
    const user = await getOrCreateUser(userId);

    const records = await db
      .select()
      .from(personalRecords)
      .where(eq(personalRecords.userId, user.id))
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const user = await getOrCreateUser(userId);

    const body = await request.json();
    const { exercise, weight } = body;

    if (!exercise || !weight) {
      return NextResponse.json(
        { error: "Exercise and weight are required" },
        { status: 400 }
      );
    }

    const newRecord = await db
      .insert(personalRecords)
      .values({
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


