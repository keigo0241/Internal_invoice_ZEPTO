import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { type NextResponse } from "next/server";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAMES,
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

export function setGoogleVerifiedEmailCookie(
  response: NextResponse,
  normalizedEmail: string,
) {
  response.cookies.set(
    AUTH_COOKIE_NAMES.googleVerifiedEmail,
    createSignedToken({
      email: normalizedEmail,
      exp:
        Math.floor(Date.now() / 1000) +
        AUTH_COOKIE_MAX_AGE_SECONDS.googleVerifiedEmail,
    }),
    {
      httpOnly: true,
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS.googleVerifiedEmail,
      path: "/",
      sameSite: "lax",
      secure: getEnv(AUTH_ENV_KEYS.nodeEnv) === "production",
    },
  );
}

export async function getCurrentGoogleVerifiedEmail() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAMES.googleVerifiedEmail)?.value;

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

export function getGoogleVerifiedEmailFromRequest(request: Request) {
  const token = getCookieValue(request, AUTH_COOKIE_NAMES.googleVerifiedEmail);

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
