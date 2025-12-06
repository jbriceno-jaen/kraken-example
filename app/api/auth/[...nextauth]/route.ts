import NextAuth from "next-auth";
import { authOptions } from "@/src/lib/auth";

// For NextAuth v4 with Next.js 16 App Router
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

