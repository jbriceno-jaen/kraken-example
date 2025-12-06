import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users, passwordResetTokens } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/src/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "El correo electrónico es requerido" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (userResult.length > 0) {
      const user = userResult[0];

      // Generate secure token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      // Invalidate any existing tokens for this user
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.userId, user.id));

      // Create new reset token
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
        used: false,
      });

      // Send email
      try {
        await sendPasswordResetEmail(user.email, user.name || "Usuario", token);
      } catch (emailError) {
        console.error("Error sending password reset email:", emailError);
        // Don't fail the request if email fails, but log it
        // In production, you might want to handle this differently
      }
    }

    // Always return success message
    return NextResponse.json({
      message: "Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

