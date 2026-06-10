import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { type NextResponse } from "next/server";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAMES,
  GOOGLE_REGISTRATION_STATUS,
} from "@/constants/auth";
import { getCookieValue } from "@/lib/http/cookies";
import { getEnv } from "@/libs/server/env/get-env";
import { getRequiredEnv } from "@/libs/server/env/get-required-env";
import { normalizeEmail } from "@/utils/validator/input/email";

const AUTH_ENV_KEYS = {
  sessionSecret: "AUTH_SESSION_SECRET",
  nodeEnv: "NODE_ENV",
} as const;

type GoogleVerifiedEmailPayload = {
  email: string;
  exp: number;
};

type GoogleAuthSession = {
  googleVerifiedEmail: string;
};

type CognitoTokenPayload = {
  exp: number;
};

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getRequiredEnv(AUTH_ENV_KEYS.sessionSecret))
    .update(payload)
    .digest("base64url");
}

function createSignedToken(payload: unknown) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifySignedToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || !isValidSignature(encodedPayload, signature)) {
    return null;
  }

  return JSON.parse(decodeBase64Url(encodedPayload)) as unknown;
}

function isValidSignature(payload: string, signature: string) {
  const expectedSignature = signPayload(payload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

function isGoogleVerifiedEmailPayload(
  value: unknown,
): value is GoogleVerifiedEmailPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<GoogleVerifiedEmailPayload>;

  return typeof payload.email === "string" && typeof payload.exp === "number";
}

function isCognitoTokenPayload(value: unknown): value is CognitoTokenPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<CognitoTokenPayload>;

  return typeof payload.exp === "number";
}

function decodeJwtPayload(token: string) {
  const [, encodedPayload] = token.split(".");

  if (!encodedPayload) {
    return null;
  }

  return JSON.parse(decodeBase64Url(encodedPayload)) as unknown;
}

function getGoogleVerifiedEmailFromToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  try {
    const payload = verifySignedToken(token);

    if (
      !isGoogleVerifiedEmailPayload(payload) ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return normalizeEmail(payload.email);
  } catch {
    return null;
  }
}

function isValidCognitoToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  try {
    const payload = decodeJwtPayload(token);

    return (
      isCognitoTokenPayload(payload) &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

function isProductionEnvironment() {
  return getEnv(AUTH_ENV_KEYS.nodeEnv) === "production";
}

function getAuthCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: isProductionEnvironment(),
  };
}

function getGoogleRegistrationStatusValue(isRegistered: boolean) {
  return isRegistered
    ? GOOGLE_REGISTRATION_STATUS.registered
    : GOOGLE_REGISTRATION_STATUS.unregistered;
}

function setGoogleVerifiedEmailCookie(response: NextResponse, normalizedEmail: string) {
  response.cookies.set(
    AUTH_COOKIE_NAMES.googleVerifiedEmail,
    createSignedToken({
      email: normalizedEmail,
      exp:
        Math.floor(Date.now() / 1000) +
        AUTH_COOKIE_MAX_AGE_SECONDS.googleVerifiedEmail,
    }),
    getAuthCookieOptions(AUTH_COOKIE_MAX_AGE_SECONDS.googleVerifiedEmail),
  );
}

function setGoogleRegistrationStatusCookie(
  response: NextResponse,
  isRegistered: boolean,
) {
  response.cookies.set(
    AUTH_COOKIE_NAMES.googleRegistrationStatus,
    getGoogleRegistrationStatusValue(isRegistered),
    getAuthCookieOptions(AUTH_COOKIE_MAX_AGE_SECONDS.googleRegistrationStatus),
  );
}

export function setGoogleAuthSessionCookies({
  response,
  normalizedEmail,
  isRegistered,
}: {
  response: NextResponse;
  normalizedEmail: string;
  isRegistered: boolean;
}) {
  setGoogleVerifiedEmailCookie(response, normalizedEmail);
  setGoogleRegistrationStatusCookie(response, isRegistered);
}

export function createGoogleRegistrationCompletedCookieHeader() {
  const cookieParts = [
    `${AUTH_COOKIE_NAMES.googleRegistrationStatus}=${GOOGLE_REGISTRATION_STATUS.registered}`,
    "Path=/",
    `Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS.googleRegistrationStatus}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (isProductionEnvironment()) {
    cookieParts.push("Secure");
  }

  return cookieParts.join("; ");
}

export async function getCurrentGoogleAuthSession(): Promise<GoogleAuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAMES.googleVerifiedEmail)?.value;
  const googleVerifiedEmail = getGoogleVerifiedEmailFromToken(token);

  return googleVerifiedEmail ? { googleVerifiedEmail } : null;
}

export function getGoogleAuthSessionFromRequest(
  request: Request,
): GoogleAuthSession | null {
  const token = getCookieValue(request, AUTH_COOKIE_NAMES.googleVerifiedEmail);
  const googleVerifiedEmail = getGoogleVerifiedEmailFromToken(token);

  return googleVerifiedEmail ? { googleVerifiedEmail } : null;
}

export function hasValidGoogleAuthSessionToken(token: string | undefined) {
  return Boolean(getGoogleVerifiedEmailFromToken(token));
}

export function hasValidCognitoAuthSessionToken(token: string | undefined) {
  return isValidCognitoToken(token);
}
