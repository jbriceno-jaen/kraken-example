import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { authOptions } from "@/src/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    
    const user = await db
      .select({
        name: users.name,
        email: users.email,
        subscriptionExpires: users.subscriptionExpires,
        wodEnabled: users.wodEnabled,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user[0].name,
      email: user[0].email,
      subscriptionExpires: user[0].subscriptionExpires?.toISOString() || null,
      wodEnabled: user[0].wodEnabled,
      image: user[0].image,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

