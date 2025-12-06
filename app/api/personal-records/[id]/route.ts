import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { personalRecords } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { getOrCreateUser } from "@/src/lib/server/user";
import { authOptions } from "@/src/lib/auth";

export async function GET(
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
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return NextResponse.json({ error: "Invalid record ID" }, { status: 400 });
    }

    const record = await db
      .select()
      .from(personalRecords)
      .where(
        and(
          eq(personalRecords.id, recordId),
          eq(personalRecords.userId, user.id)
        )
      )
      .limit(1);

    if (record.length === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ record: record[0] });
  } catch (error) {
    console.error("Error fetching personal record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return NextResponse.json({ error: "Invalid record ID" }, { status: 400 });
    }

    const body = await request.json();
    const { exercise, weight } = body;

    // Check if record exists and belongs to user
    const existing = await db
      .select()
      .from(personalRecords)
      .where(
        and(
          eq(personalRecords.id, recordId),
          eq(personalRecords.userId, user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const updated = await db
      .update(personalRecords)
      .set({
        exercise: exercise?.trim() || existing[0].exercise,
        weight: weight?.trim() || existing[0].weight,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(personalRecords.id, recordId),
          eq(personalRecords.userId, user.id)
        )
      )
      .returning();

    return NextResponse.json({ record: updated[0] });
  } catch (error) {
    console.error("Error updating personal record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return NextResponse.json({ error: "Invalid record ID" }, { status: 400 });
    }

    // Check if record exists and belongs to user
    const existing = await db
      .select()
      .from(personalRecords)
      .where(
        and(
          eq(personalRecords.id, recordId),
          eq(personalRecords.userId, user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await db
      .delete(personalRecords)
      .where(
        and(
          eq(personalRecords.id, recordId),
          eq(personalRecords.userId, user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting personal record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


