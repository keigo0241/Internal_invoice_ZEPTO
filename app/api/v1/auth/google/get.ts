import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAMES,
} from "@/constants/auth";
import { createGoogleAuthorizationUrl } from "@/features/auth/services/google-oauth";
import { type ApiHandler } from "@/lib/api/types";

export const handleGet: ApiHandler = async (ctx) => {
  const requestUrl = new URL(ctx.request.url);
  const state = crypto.randomUUID();
  const authorizationUrl = createGoogleAuthorizationUrl(requestUrl.origin, state);
  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set(AUTH_COOKIE_NAMES.googleOauthState, state, {
    httpOnly: true,
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS.googleOauthState,
    path: "/",
    sameSite: "lax",
    secure: requestUrl.protocol === "https:",
  });

  return response;
};
