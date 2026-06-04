import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAMES,
  GOOGLE_AUTH_CONFIG,
} from "@/constants/auth";

export function proxy(request: NextRequest) {
  const hasGoogleVerifiedEmail = request.cookies.has(
    AUTH_COOKIE_NAMES.googleVerifiedEmail,
  );

  if (hasGoogleVerifiedEmail) {
    return NextResponse.next();
  }

  return NextResponse.redirect(
    new URL(GOOGLE_AUTH_CONFIG.loginPath, request.url),
  );
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/invoices/:path*",
    "/profile/:path*",
    "/requests/:path*",
    "/users/:path*",
  ],
};
