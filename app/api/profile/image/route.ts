import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateUser } from "@/src/lib/server/user";
import { authOptions } from "@/src/lib/auth";

// POST - Upload/Update profile image
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    
    // Verify user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      // If not a valid URL, check if it's base64
      if (!imageUrl.startsWith('data:image/')) {
        return NextResponse.json(
          { error: "Invalid image URL format" },
          { status: 400 }
        );
      }
    }

    // Update user image
    const updated = await db
      .update(users)
      .set({
        image: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
    }

    return NextResponse.json({ 
      image: updated[0].image,
      message: "Profile image updated successfully" 
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove profile image
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Remove user image
    await db
      .update(users)
      .set({
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ message: "Profile image removed successfully" });
  } catch (error) {
    console.error("Error removing profile image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

