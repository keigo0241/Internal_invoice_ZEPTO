import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAMES,
  GOOGLE_AUTH_CONFIG,
  LOGIN_ERROR_CODE,
  type LoginErrorCode,
} from "@/constants/auth";
import { getGoogleLoginErrorCode } from "@/features/auth/services/google-auth-policy";
import { getGoogleAuthNextStep } from "@/features/auth/services/google-auth-flow";
import {
  exchangeGoogleCodeForIdToken,
  verifyGoogleIdToken,
} from "@/features/auth/services/google-oauth";
import {
  setGoogleAuthSessionCookies,
} from "@/features/auth/services/session";
import { type ApiHandler } from "@/lib/api/types";
import { getCookieValue } from "@/lib/http/cookies";
import { logger } from "@/lib/logger/logger";
import { normalizeEmail } from "@/utils/validator/input/email";

function createLoginRedirect(request: Request, errorCode: LoginErrorCode) {
  const requestUrl = new URL(request.url);
  const url = new URL(GOOGLE_AUTH_CONFIG.loginPath, requestUrl.origin);
  url.searchParams.set("error", errorCode);

  const response = NextResponse.redirect(url);
  response.cookies.delete(AUTH_COOKIE_NAMES.googleOauthState);

  return response;
}

function createSuccessRedirect(request: Request, pathname: string) {
  const requestUrl = new URL(request.url);
  const url = new URL(pathname, requestUrl.origin);
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

  const normalizedGoogleEmail = normalizeEmail(googleUser.email);
  const domainErrorCode = getGoogleLoginErrorCode(normalizedGoogleEmail);

  if (domainErrorCode) {
    logger.warn({
      message: "Google OAuth login rejected by domain policy.",
      context: {
        path: requestUrl.pathname,
        traceId: ctx.traceId,
        emailDomain: normalizedGoogleEmail.split("@")[1],
        errorCode: domainErrorCode,
      },
    });

    return createLoginRedirect(ctx.request, domainErrorCode);
  }

  let nextStep: Awaited<ReturnType<typeof getGoogleAuthNextStep>>;

  try {
    nextStep = await getGoogleAuthNextStep(normalizedGoogleEmail);
  } catch (error) {
    logger.error({
      message: "Google OAuth user registration lookup failed.",
      context: {
        path: requestUrl.pathname,
        traceId: ctx.traceId,
      },
      error,
    });

    return createLoginRedirect(ctx.request, LOGIN_ERROR_CODE.dbConnectionFailed);
  }

  const response = createSuccessRedirect(ctx.request, nextStep.nextPath);
  setGoogleAuthSessionCookies({
    response,
    normalizedEmail: normalizedGoogleEmail,
    isRegistered: nextStep.isRegistered,
  });

  return response;
};
