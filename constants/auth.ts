export const LOGIN_PAGE_TEXT = {
  title: "ログイン",
  descriptionLine1: "〇〇〇@zpt-ai.comのGoogleアカウントで",
  descriptionLine2: "認証してください。",
  googleAuthButton: "Google認証はこちら",
  note: "Google認証後にアプリ内ログインを行います",
} as const;

export const LOGIN_PAGE_ASSETS = {
  logoSrc: "/icons/zeptologo.png",
  logoAlt: "ZEPTO ロゴ",
} as const;

export const GOOGLE_AUTH_CONFIG = {
  allowedDomain: "zpt-ai.com",
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  tokenInfoEndpoint: "https://oauth2.googleapis.com/tokeninfo",
  startPath: "/api/auth/google",
  callbackPath: "/api/auth/google/callback",
  loginPath: "/login",
  appLoginPath: "/app-login",
  initialRegistrationPath: "/initial-registration",
  successPath: "/invoices",
} as const;

export const LOGIN_ERROR_CODE = {
  invalidGoogleDomain: "invalid_google_domain",
  googleAuthFailed: "google_auth_failed",
  invalidGoogleState: "invalid_google_state",
} as const;

export type LoginErrorCode =
  (typeof LOGIN_ERROR_CODE)[keyof typeof LOGIN_ERROR_CODE];

export const LOGIN_ERROR_MESSAGES: Record<LoginErrorCode, string> = {
  [LOGIN_ERROR_CODE.invalidGoogleDomain]:
    "社内アカウント（@zpt-ai.com）でログインしてください。",
  [LOGIN_ERROR_CODE.googleAuthFailed]:
    "Google認証に失敗しました。もう一度お試しください。",
  [LOGIN_ERROR_CODE.invalidGoogleState]:
    "認証情報を確認できませんでした。もう一度ログインしてください。",
};

export const AUTH_COOKIE_NAMES = {
  googleOauthState: "google_oauth_state",
  googleVerifiedEmail: "google_verified_email",
} as const;

export const AUTH_COOKIE_MAX_AGE_SECONDS = {
  googleOauthState: 10 * 60,
  googleVerifiedEmail: 10 * 60,
} as const;
