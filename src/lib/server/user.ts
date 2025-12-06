import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Gets or creates a user record in the database from Clerk ID
 * This ensures all users have a proper database record that can be referenced
 * 
 * @param clerkId - The Clerk user ID
 * @returns The user record from the database
 */
export async function getOrCreateUser(clerkId: string) {
  // First, try to find existing user
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (existingUser.length > 0) {
    return existingUser[0];
  }

  // If user doesn't exist, get info from Clerk and create it
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    throw new Error("Clerk user not found");
  }

  // Extract name and email from Clerk user
  const name = clerkUser.firstName && clerkUser.lastName
    ? `${clerkUser.firstName} ${clerkUser.lastName}`
    : clerkUser.firstName || clerkUser.lastName || clerkUser.username || "User";
  
  const email = clerkUser.emailAddresses[0]?.emailAddress || `${clerkId}@unknown.com`;

  // Create new user in database
  const [newUser] = await db
    .insert(users)
    .values({
      clerkId,
      name,
      email,
      age: 0, // Default age, can be updated later
    })
    .returning();

  return newUser;
}
