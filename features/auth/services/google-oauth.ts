import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { getEnv } from "@/libs/server/env/get-env";
import { getRequiredEnv } from "@/libs/server/env/get-required-env";

const GOOGLE_AUTH_ENV_KEYS = {
  clientId: "GOOGLE_CLIENT_ID",
  clientSecret: "GOOGLE_CLIENT_SECRET",
  redirectUri: "GOOGLE_REDIRECT_URI",
} as const;

const GOOGLE_FETCH_TIMEOUT_MS = 10000;

type GoogleTokenResponse = {
  id_token?: string;
};

type GoogleTokenInfo = {
  sub: string;
  email: string;
  email_verified: string | boolean;
  aud: string;
  iss: string;
  exp: string;
  hd?: string;
};

function getRedirectUri(origin: string) {
  return (
    getEnv(GOOGLE_AUTH_ENV_KEYS.redirectUri) ??
    `${origin}${GOOGLE_AUTH_CONFIG.callbackPath}`
  );
}

function isGoogleTokenInfo(value: unknown): value is GoogleTokenInfo {
  if (!value || typeof value !== "object") {
    return false;
  }

  const tokenInfo = value as Partial<GoogleTokenInfo>;

  return (
    typeof tokenInfo.sub === "string" &&
    typeof tokenInfo.email === "string" &&
    (typeof tokenInfo.email_verified === "string" ||
      typeof tokenInfo.email_verified === "boolean") &&
    typeof tokenInfo.aud === "string" &&
    typeof tokenInfo.iss === "string" &&
    typeof tokenInfo.exp === "string"
  );
}

function assertValidGoogleTokenInfo(value: unknown): GoogleTokenInfo {
  if (!isGoogleTokenInfo(value)) {
    throw new Error("Invalid Google token info response.");
  }

  const clientId = getRequiredEnv(GOOGLE_AUTH_ENV_KEYS.clientId);
  const isEmailVerified =
    value.email_verified === true || value.email_verified === "true";
  const issuerAllowed =
    value.iss === "https://accounts.google.com" ||
    value.iss === "accounts.google.com";
  const isExpired = Number(value.exp) <= Math.floor(Date.now() / 1000);

  if (value.aud !== clientId || !issuerAllowed || !isEmailVerified || isExpired) {
    throw new Error("Google token validation failed.");
  }

  return value;
}

export function createGoogleAuthorizationUrl(origin: string, state: string) {
  const url = new URL(GOOGLE_AUTH_CONFIG.authorizationEndpoint);

  url.searchParams.set("client_id", getRequiredEnv(GOOGLE_AUTH_ENV_KEYS.clientId));
  url.searchParams.set("redirect_uri", getRedirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  return url;
}

export async function exchangeGoogleCodeForIdToken(
  code: string,
  origin: string,
) {
  const response = await fetch(GOOGLE_AUTH_CONFIG.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    signal: AbortSignal.timeout(GOOGLE_FETCH_TIMEOUT_MS),
    body: new URLSearchParams({
      client_id: getRequiredEnv(GOOGLE_AUTH_ENV_KEYS.clientId),
      client_secret: getRequiredEnv(GOOGLE_AUTH_ENV_KEYS.clientSecret),
      code,
      grant_type: "authorization_code",
      redirect_uri: getRedirectUri(origin),
    }),
  });

  if (!response.ok) {
    throw new Error("Google token exchange failed.");
  }

  const tokenResponse = (await response.json()) as GoogleTokenResponse;

  if (!tokenResponse.id_token) {
    throw new Error("Google id token is missing.");
  }

  return tokenResponse.id_token;
}

export async function verifyGoogleIdToken(idToken: string) {
  const url = new URL(GOOGLE_AUTH_CONFIG.tokenInfoEndpoint);
  url.searchParams.set("id_token", idToken);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(GOOGLE_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error("Google id token verification failed.");
  }

  return assertValidGoogleTokenInfo(await response.json());
}
