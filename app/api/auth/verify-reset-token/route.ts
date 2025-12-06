import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { passwordResetTokens } from "@/src/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "El token es requerido" },
        { status: 400 }
      );
    }

    // Find valid reset token
    const tokenResult = await db
      .select({
        id: passwordResetTokens.id,
        expiresAt: passwordResetTokens.expiresAt,
        used: passwordResetTokens.used,
      })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (tokenResult.length === 0) {
      return NextResponse.json(
        { valid: false, error: "Token inválido o expirado" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
    });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json(
      { valid: false, error: "Error al verificar el token" },
      { status: 500 }
    );
  }
}

