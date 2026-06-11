import {
  createHmac,
  createPublicKey,
  timingSafeEqual,
  verify as verifyCryptoSignature,
} from "crypto";
import { cookies } from "next/headers";
import { type NextResponse } from "next/server";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAMES,
  GOOGLE_REGISTRATION_STATUS,
} from "@/constants/auth";
import { type CognitoAuthTokens } from "@/features/auth/types/app-login";
import { getCookieValue } from "@/lib/http/cookies";
import { getCognitoTokenVerificationConfig } from "@/libs/cognito-config";
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
  aud: string;
  exp: number;
  iss: string;
  token_use: string;
};

type CognitoTokenHeader = {
  alg: string;
  kid: string;
};

type CognitoJwk = JsonWebKey & {
  [key: string]: unknown;
  kid: string;
  kty: string;
};

type CognitoJwks = {
  keys: CognitoJwk[];
};

type GlobalWithCognitoJwks = typeof globalThis & {
  cognitoJwks?: CognitoJwks;
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

  return (
    typeof payload.aud === "string" &&
    typeof payload.exp === "number" &&
    typeof payload.iss === "string" &&
    typeof payload.token_use === "string"
  );
}

function isCognitoTokenHeader(value: unknown): value is CognitoTokenHeader {
  if (!value || typeof value !== "object") {
    return false;
  }

  const header = value as Partial<CognitoTokenHeader>;

  return typeof header.alg === "string" && typeof header.kid === "string";
}

function decodeJwtPart(value: string) {
  return JSON.parse(decodeBase64Url(value)) as unknown;
}

function parseJwt(token: string) {
  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    return null;
  }

  return {
    encodedHeader,
    encodedPayload,
    header: decodeJwtPart(encodedHeader),
    payload: decodeJwtPart(encodedPayload),
    signature,
    signingInput: `${encodedHeader}.${encodedPayload}`,
  };
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

function getCognitoIssuer() {
  const { region, userPoolId } = getCognitoTokenVerificationConfig();

  return `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
}

function getCognitoJwksUrl() {
  return `${getCognitoIssuer()}/.well-known/jwks.json`;
}

async function fetchCognitoJwks() {
  const globalWithCognitoJwks = globalThis as GlobalWithCognitoJwks;

  if (globalWithCognitoJwks.cognitoJwks) {
    return globalWithCognitoJwks.cognitoJwks;
  }

  const response = await fetch(getCognitoJwksUrl());

  if (!response.ok) {
    return null;
  }

  const jwks = (await response.json()) as CognitoJwks;
  globalWithCognitoJwks.cognitoJwks = jwks;

  return jwks;
}

async function getCognitoJwk(kid: string) {
  const jwks = await fetchCognitoJwks();

  return jwks?.keys.find((key) => key.kid === kid) ?? null;
}

function isValidCognitoTokenClaims(payload: CognitoTokenPayload) {
  const { appClientId } = getCognitoTokenVerificationConfig();

  return (
    payload.exp > Math.floor(Date.now() / 1000) &&
    payload.iss === getCognitoIssuer() &&
    payload.aud === appClientId &&
    payload.token_use === "id"
  );
}

function verifyCognitoTokenSignature({
  jwk,
  signingInput,
  signature,
}: {
  jwk: CognitoJwk;
  signingInput: string;
  signature: string;
}) {
  const publicKey = createPublicKey({
    key: jwk,
    format: "jwk",
  });

  return verifyCryptoSignature(
    "RSA-SHA256",
    Buffer.from(signingInput),
    publicKey,
    Buffer.from(signature, "base64url"),
  );
}

async function isValidCognitoToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  try {
    const jwt = parseJwt(token);

    if (!jwt) {
      return false;
    }

    if (!isCognitoTokenHeader(jwt.header) || jwt.header.alg !== "RS256") {
      return false;
    }

    if (
      !isCognitoTokenPayload(jwt.payload) ||
      !isValidCognitoTokenClaims(jwt.payload)
    ) {
      return false;
    }

    const jwk = await getCognitoJwk(jwt.header.kid);

    return jwk
      ? verifyCognitoTokenSignature({
          jwk,
          signingInput: jwt.signingInput,
          signature: jwt.signature,
        })
      : false;
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

function appendCookieHeader({
  headers,
  name,
  value,
  maxAge,
}: {
  headers: Headers;
  name: string;
  value: string;
  maxAge: number;
}) {
  const cookieParts = [
    `${name}=${value}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (isProductionEnvironment()) {
    cookieParts.push("Secure");
  }

  headers.append("Set-Cookie", cookieParts.join("; "));
}

function appendExpiredCookieHeader(headers: Headers, name: string) {
  const cookieParts = [
    `${name}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (isProductionEnvironment()) {
    cookieParts.push("Secure");
  }

  headers.append("Set-Cookie", cookieParts.join("; "));
}

export function createCognitoAuthSessionCookieHeaders(tokens: CognitoAuthTokens) {
  const headers = new Headers();

  appendCookieHeader({
    headers,
    name: AUTH_COOKIE_NAMES.cognitoIdToken,
    value: tokens.idToken,
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS.cognitoIdToken,
  });
  appendCookieHeader({
    headers,
    name: AUTH_COOKIE_NAMES.cognitoAccessToken,
    value: tokens.accessToken,
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS.cognitoAccessToken,
  });
  appendCookieHeader({
    headers,
    name: AUTH_COOKIE_NAMES.cognitoRefreshToken,
    value: tokens.refreshToken,
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS.cognitoRefreshToken,
  });

  return headers;
}

export function createLogoutCookieHeaders() {
  const headers = new Headers();

  Object.values(AUTH_COOKIE_NAMES).forEach((cookieName) => {
    appendExpiredCookieHeader(headers, cookieName);
  });

  return headers;
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

export async function hasValidCognitoAuthSessionToken(token: string | undefined) {
  return isValidCognitoToken(token);
}
