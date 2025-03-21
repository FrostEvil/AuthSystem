import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);
import { PUBLIC_ROUTES, PROTECTED_SUB_ROUTES, LOGIN, ROOT } from "./lib/routes";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // Exclude NextAuth API routes to prevent auth errors
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const session = await auth();
  const isAuthenticated = !!session?.user;

  const isPublicRoute =
    PUBLIC_ROUTES.some(
      (route) => nextUrl.pathname.startsWith(route) || nextUrl.pathname === ROOT
    ) &&
    !PROTECTED_SUB_ROUTES.some((route) => nextUrl.pathname.includes(route));

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL(LOGIN, nextUrl));
  }
  if (isAuthenticated && nextUrl.pathname.includes(LOGIN))
    return NextResponse.redirect(new URL("/products", nextUrl));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|api/auth).*)", "/", "/(api|trpc)(.*)"],
};
