import { NextResponse } from "next/server";
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
import { type ApiHandler } from "@/lib/api/types";
import { logger } from "@/lib/logger/logger";

function getCookieValue(request: Request, cookieName: string) {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return undefined;
  }

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
}

function createLoginRedirect(request: Request, errorCode: LoginErrorCode) {
  const requestUrl = new URL(request.url);
  const url = new URL(GOOGLE_AUTH_CONFIG.loginPath, requestUrl.origin);
  url.searchParams.set("error", errorCode);

  const response = NextResponse.redirect(url);
  response.cookies.delete(AUTH_COOKIE_NAMES.googleOauthState);

  return response;
}

function createSuccessRedirect(request: Request) {
  const requestUrl = new URL(request.url);
  const url = new URL(GOOGLE_AUTH_CONFIG.appLoginPath, requestUrl.origin);
  const response = NextResponse.redirect(url);
  response.cookies.delete(AUTH_COOKIE_NAMES.googleOauthState);

  return response;
}

export const handleGet: ApiHandler = async (ctx) => {
  const requestUrl = new URL(ctx.request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const savedState = getCookieValue(
    ctx.request,
    AUTH_COOKIE_NAMES.googleOauthState,
  );

  if (!code) {
    return createLoginRedirect(ctx.request, LOGIN_ERROR_CODE.googleAuthFailed);
  }

  if (!state || !savedState || state !== savedState) {
    return createLoginRedirect(ctx.request, LOGIN_ERROR_CODE.invalidGoogleState);
  }

  let googleUser: Awaited<ReturnType<typeof verifyGoogleIdToken>>;

  try {
    const idToken = await exchangeGoogleCodeForIdToken(code, requestUrl.origin);
    googleUser = await verifyGoogleIdToken(idToken);
  } catch (error) {
    logger.error({
      message: "Google OAuth token verification failed.",
      context: {
        path: requestUrl.pathname,
        traceId: ctx.traceId,
      },
      error,
    });

    return createLoginRedirect(ctx.request, LOGIN_ERROR_CODE.googleAuthFailed);
  }

  const domainErrorCode = getGoogleLoginErrorCode(googleUser.email);

  if (domainErrorCode) {
    return createLoginRedirect(ctx.request, domainErrorCode);
  }

  const response = createSuccessRedirect(ctx.request);
  setGoogleVerifiedEmailCookie(response, googleUser.email);

  return response;
};
