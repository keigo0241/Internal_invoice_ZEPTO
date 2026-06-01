import {
  GOOGLE_AUTH_CONFIG,
  LOGIN_ERROR_CODE,
  type LoginErrorCode,
} from "@/constants/auth";

function normalizeDomain(domain: string) {
  return domain.trim().toLowerCase();
}

export function isAllowedGoogleEmailDomain(email: string) {
  const allowedDomain = normalizeDomain(GOOGLE_AUTH_CONFIG.allowedDomain);

  return email
    .trim()
    .toLowerCase()
    .endsWith(`@${allowedDomain}`);
}

export function getGoogleLoginErrorCode(email: string): LoginErrorCode | null {
  if (isAllowedGoogleEmailDomain(email)) {
    return null;
  }

  return LOGIN_ERROR_CODE.invalidGoogleDomain;
}
