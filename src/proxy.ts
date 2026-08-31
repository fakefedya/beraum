import NextAuth from "next-auth";
import { authConfig } from "@/src/lib/auth/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const authRoutes = ["/auth/login", "/auth/error"];
const apiPrefix = "/api";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  const isApiAuthRoute = nextUrl.pathname.startsWith(`${apiPrefix}/auth`);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isProtectedApi = nextUrl.pathname.startsWith(`${apiPrefix}/admin`);

  if (isApiAuthRoute) return response;

  if (isAuthRoute) {
    if (isLoggedIn && !nextUrl.searchParams.has("error")) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return response;
  }

  if (isDashboardRoute || isProtectedApi) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }
  }

  return response;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
