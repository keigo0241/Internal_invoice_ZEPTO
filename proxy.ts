import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAMES,
} from "@/constants/auth";
import {
  getAuthRedirectPath,
  hasCognitoLoginToken,
} from "@/features/auth/services/route-access-policy";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasGoogleVerifiedEmail = request.cookies.has(
    AUTH_COOKIE_NAMES.googleVerifiedEmail,
  );
  const googleRegistrationStatus = request.cookies.get(
    AUTH_COOKIE_NAMES.googleRegistrationStatus,
  )?.value;
  const redirectPath = getAuthRedirectPath({
    pathname,
    hasGoogleVerifiedEmail,
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
