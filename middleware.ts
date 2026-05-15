import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes — require admin role
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes — always allow
        if (
          pathname === "/" ||
          pathname.startsWith("/gallery") ||
          pathname.startsWith("/artwork") ||
          pathname.startsWith("/contact") ||
          pathname.startsWith("/order") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/artworks") ||
          pathname.startsWith("/api/contact") ||
          pathname.startsWith("/api/upload") ||
          (pathname.startsWith("/api/orders") && req.method === "POST")
        ) {
          return true;
        }

        // Protected routes — require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/api/payment/:path*",
    "/api/payments/:path*",
    "/api/upload/:path*",
    "/api/dashboard/:path*",
  ],
};
