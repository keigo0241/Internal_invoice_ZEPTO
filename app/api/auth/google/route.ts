import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAMES,
} from "@/constants/auth";
import { createGoogleAuthorizationUrl } from "@/features/auth/services/google-oauth";

export function GET(request: NextRequest) {
  const state = crypto.randomUUID();
  const authorizationUrl = createGoogleAuthorizationUrl(request.nextUrl.origin, state);
  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set(AUTH_COOKIE_NAMES.googleOauthState, state, {
    httpOnly: true,
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS.googleOauthState,
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });

  return response;
}
