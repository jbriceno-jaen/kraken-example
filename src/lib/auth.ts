import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // Using JWT strategy for credentials provider
  // Adapter can be added later if OAuth providers are needed
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[AUTH] Missing credentials - email or password not provided");
            return null;
          }

          // Normalize email (lowercase and trim)
          const normalizedEmail = credentials.email.trim().toLowerCase();
          console.log("[AUTH] Attempting login for email:", normalizedEmail);

          // Query user from database - always get the latest data including approval status
          const userResult = await db
            .select({
              id: users.id,
              email: users.email,
              name: users.name,
              password: users.password,
              role: users.role,
              approved: users.approved,
              subscriptionExpires: users.subscriptionExpires,
              image: users.image,
            })
            .from(users)
            .where(eq(users.email, normalizedEmail))
            .limit(1);

          if (userResult.length === 0) {
            console.error("[AUTH] User not found for email:", normalizedEmail);
            return null;
          }

          const user = userResult[0];
          console.log("[AUTH] User found - ID:", user.id, "Email:", user.email, "Has password:", !!user.password, "Approved:", user.approved, "Role:", user.role);

          if (!user.password) {
            console.error("[AUTH] User has no password set - ID:", user.id);
            return null;
          }

          // Compare password
          console.log("[AUTH] Comparing password...");
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            console.error("[AUTH] Invalid password for user:", user.id);
            console.error("[AUTH] Password hash in DB:", user.password.substring(0, 20) + "...");
            return null;
          }

          // Check if user is approved (managers are always approved, clients need approval)
          // Always check the latest approval status from database
          if (user.role === "client" && !user.approved) {
            console.error("[AUTH] User not approved - ID:", user.id, "Email:", user.email, "Approved:", user.approved);
            // Return null to prevent login, but we'll show specific message in login modal
            return null;
          }

          // Check if subscription is expired (only for clients, managers are not affected)
          if (user.role === "client" && user.subscriptionExpires) {
            const now = new Date();
            const expirationDate = new Date(user.subscriptionExpires);
            // Set expiration date to end of day for comparison
            expirationDate.setHours(23, 59, 59, 999);
            
            if (now > expirationDate) {
              console.error("[AUTH] Subscription expired - ID:", user.id, "Email:", user.email, "Expired:", expirationDate);
              return null; // Subscription expired, will show specific message in login modal
            }
          }

          console.log("[AUTH] Login successful for user:", user.id, "Role:", user.role || "client");
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.image || undefined,
            role: user.role || "client",
          };
        } catch (error) {
          console.error("[AUTH] Authorization error:", error);
          if (error instanceof Error) {
            console.error("[AUTH] Error message:", error.message);
            console.error("[AUTH] Error stack:", error.stack);
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Reduce session update frequency to minimize cookie writes
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        // Only store essential data in JWT to keep cookie size small
        // name and email will be fetched from database when needed
        if (user) {
          // Store only minimal data - use numeric ID to reduce size
          token.id = user.id;
          token.role = (user as any).role || "client";
          // Remove any default NextAuth fields that might be added
          delete (token as any).name;
          delete (token as any).email;
          delete (token as any).picture;
          delete (token as any).image;
          delete (token as any).sub;
        }
        // Return only essential fields - NextAuth will add iat, exp automatically
        // Don't include jti if not needed to reduce size
        const minimalToken: any = {
          id: token.id,
          role: token.role,
        };
        // Only include iat and exp if they exist (NextAuth adds them automatically)
        if (token.iat) minimalToken.iat = token.iat;
        if (token.exp) minimalToken.exp = token.exp;
        return minimalToken;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        // Ensure session and user exist
        if (!session) {
          return { user: {} } as any;
        }

        if (!session.user) {
          session.user = {} as any;
        }

        // Only assign essential data from token to keep session cookie small
        // name and email should be fetched from /api/user-data when needed
        if (token) {
          if (token.id) {
            session.user.id = String(token.id);
          }
          if (token.role) {
            session.user.role = String(token.role);
          }
        }

        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        // Return a valid session structure even if there's an error
        return {
          user: {
            id: token?.id ? String(token.id) : "",
            role: token?.role ? String(token.role) : "client",
          },
        } as any;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-change-in-production",
  debug: process.env.NODE_ENV === "development",
  // Cookie configuration for better browser compatibility (especially Chrome)
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // In development, secure must be false for localhost (Chrome requirement)
        secure: process.env.NODE_ENV === "production",
        // Don't set domain in development (localhost doesn't need it)
        // Setting domain to undefined allows cookies to work in Chrome localhost
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

