import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

/**
 * Gets or creates a user record in the database
 * This ensures all users have a proper database record that can be referenced
 * 
 * @param userId - The user ID (from NextAuth session)
 * @returns The user record from the database
 */
export async function getOrCreateUser(userId: string | number) {
  const userIdNum = typeof userId === "string" ? parseInt(userId) : userId;
  
  if (isNaN(userIdNum)) {
    throw new Error("Invalid user ID");
  }

  // Try to find existing user
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userIdNum))
    .limit(1);

  if (existingUser.length > 0) {
    return existingUser[0];
  }

  throw new Error("User not found");
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user.length > 0 ? user[0] : null;
}
