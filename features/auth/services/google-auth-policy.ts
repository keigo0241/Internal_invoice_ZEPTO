import {
  GOOGLE_AUTH_CONFIG,
  LOGIN_ERROR_CODE,
  type LoginErrorCode,
} from "@/constants/auth";

export function isAllowedGoogleEmailDomain(email: string) {
  return email
    .trim()
    .toLowerCase()
    .endsWith(`@${GOOGLE_AUTH_CONFIG.allowedDomain}`);
}

export function getGoogleLoginErrorCode(email: string): LoginErrorCode | null {
  if (isAllowedGoogleEmailDomain(email)) {
    return null;
  }

  return LOGIN_ERROR_CODE.invalidGoogleDomain;
}
