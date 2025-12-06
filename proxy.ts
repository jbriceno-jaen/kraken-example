import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Don't protect login, register, or auth routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Get token - NextAuth will automatically find the correct cookie
  // Use the same secret as in authOptions
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-change-in-production"
  });

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect dashboard and API routes
    "/dashboard/:path*",
    "/manager/:path*",
    "/api/profile/:path*",
    "/api/reservations/:path*",
    "/api/personal-records/:path*",
    "/api/manager/:path*",
  ],
};

