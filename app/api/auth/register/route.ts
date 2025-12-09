import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/src/lib/server/user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input - check for missing fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Trim and validate name - allow spaces and multiple words
    const trimmedName = name.trim();
    if (!trimmedName) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }
    if (trimmedName.length > 255) {
      return NextResponse.json(
        { error: "Name cannot exceed 255 characters" },
        { status: 400 }
      );
    }
    // Allow letters, spaces, and common name characters (accented letters)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedName)) {
      return NextResponse.json(
        { error: "Name can only contain letters and spaces" },
        { status: 400 }
      );
    }

    // Validate email format
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Enter a valid email address" },
        { status: 400 }
      );
    }
    if (trimmedEmail.length > 255) {
      return NextResponse.json(
        { error: "Email cannot exceed 255 characters" },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    if (password.length > 128) {
      return NextResponse.json(
        { error: "Password cannot exceed 128 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists (use trimmed email)
    const existingUser = await getUserByEmail(trimmedEmail);
    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (use trimmed values)
    // Clients are created with approved: false, they need manager approval
    const [newUser] = await db
      .insert(users)
      .values({
        name: trimmedName,
        email: trimmedEmail,
        password: hashedPassword,
        age: 0,
        approved: false, // Client needs manager approval
      })
      .returning();

    return NextResponse.json(
      {
        message: "User created successfully. Your account is pending approval by the administrator.",
        requiresApproval: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      // Check for database constraint violations
      if (error.message.includes("unique") || error.message.includes("duplicate")) {
        return NextResponse.json(
          { error: "This email is already registered" },
          { status: 400 }
        );
      }
      
      // Check for database connection errors
      if (error.message.includes("connect") || error.message.includes("timeout")) {
        return NextResponse.json(
          { error: "Database connection error. Please try again later." },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error registering user" },
      { status: 500 }
    );
  }
}

