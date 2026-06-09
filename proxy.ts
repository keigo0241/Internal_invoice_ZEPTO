import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/constants/auth";
import { hasValidGoogleVerifiedEmailToken } from "@/features/auth/services/session";
import {
  getAuthRedirectPath,
  hasCognitoLoginToken,
} from "@/features/auth/services/route-access-policy";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const googleVerifiedEmailToken = request.cookies.get(
    AUTH_COOKIE_NAMES.googleVerifiedEmail,
  )?.value;
  const googleRegistrationStatus = request.cookies.get(
    AUTH_COOKIE_NAMES.googleRegistrationStatus,
  )?.value;
  const redirectPath = getAuthRedirectPath({
    pathname,
    hasGoogleVerifiedEmail: hasValidGoogleVerifiedEmailToken(
      googleVerifiedEmailToken,
    ),
    googleRegistrationStatus,
    hasCognitoIdToken: hasCognitoLoginToken(request.cookies),
  });

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/app-login",
    "/initial-registration",
    "/dashboard/:path*",
    "/invoices/:path*",
    "/profile/:path*",
    "/requests/:path*",
    "/users/:path*",
  ],
};
