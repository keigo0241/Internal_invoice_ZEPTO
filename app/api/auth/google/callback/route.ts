import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAMES,
  GOOGLE_AUTH_CONFIG,
  LOGIN_ERROR_CODE,
  type LoginErrorCode,
} from "@/constants/auth";
import { getGoogleLoginErrorCode } from "@/features/auth/services/google-auth-policy";
import {
  exchangeGoogleCodeForIdToken,
  verifyGoogleIdToken,
} from "@/features/auth/services/google-oauth";
import { setGoogleVerifiedEmailCookie } from "@/features/auth/services/session";

function createLoginRedirect(request: NextRequest, errorCode: LoginErrorCode) {
  const url = new URL(GOOGLE_AUTH_CONFIG.loginPath, request.nextUrl.origin);
  url.searchParams.set("error", errorCode);

  const response = NextResponse.redirect(url);
  response.cookies.delete(AUTH_COOKIE_NAMES.googleOauthState);

  return response;
}

function createSuccessRedirect(request: NextRequest) {
  const url = new URL(GOOGLE_AUTH_CONFIG.appLoginPath, request.nextUrl.origin);
  const response = NextResponse.redirect(url);
  response.cookies.delete(AUTH_COOKIE_NAMES.googleOauthState);

  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get(AUTH_COOKIE_NAMES.googleOauthState)?.value;

  if (!code) {
    return createLoginRedirect(request, LOGIN_ERROR_CODE.googleAuthFailed);
  }

  if (!state || !savedState || state !== savedState) {
    return createLoginRedirect(request, LOGIN_ERROR_CODE.invalidGoogleState);
  }

  let googleUser: Awaited<ReturnType<typeof verifyGoogleIdToken>>;

  try {
    const idToken = await exchangeGoogleCodeForIdToken(code, request.nextUrl.origin);
    googleUser = await verifyGoogleIdToken(idToken);
  } catch (error) {
    console.error("Google OAuth token verification failed.", error);

    return createLoginRedirect(request, LOGIN_ERROR_CODE.googleAuthFailed);
  }

  const domainErrorCode = getGoogleLoginErrorCode(googleUser.email);

  if (domainErrorCode) {
    return createLoginRedirect(request, domainErrorCode);
  }

  const response = createSuccessRedirect(request);
  setGoogleVerifiedEmailCookie(response, googleUser.email);

  return response;
}
