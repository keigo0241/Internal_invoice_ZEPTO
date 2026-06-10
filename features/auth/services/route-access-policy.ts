import { GOOGLE_AUTH_CONFIG, GOOGLE_REGISTRATION_STATUS } from "@/constants/auth";

type RouteAccessPolicyParams = {
  pathname: string;
  hasGoogleVerifiedEmail: boolean;
  googleRegistrationStatus?: string;
  hasCognitoIdToken: boolean;
};

function isAuthPage(pathname: string) {
  return (
    pathname === GOOGLE_AUTH_CONFIG.loginPath ||
    pathname === GOOGLE_AUTH_CONFIG.initialRegistrationPath ||
    pathname === GOOGLE_AUTH_CONFIG.appLoginPath
  );
}

function isGoogleRegistered(googleRegistrationStatus?: string) {
  return googleRegistrationStatus === GOOGLE_REGISTRATION_STATUS.registered;
}

export function getAuthRedirectPath({
  pathname,
  hasGoogleVerifiedEmail,
  googleRegistrationStatus,
  hasCognitoIdToken,
}: RouteAccessPolicyParams) {
  if (!hasGoogleVerifiedEmail) {
    return pathname === GOOGLE_AUTH_CONFIG.loginPath
      ? null
      : GOOGLE_AUTH_CONFIG.loginPath;
  }

  if (!isGoogleRegistered(googleRegistrationStatus)) {
    return pathname === GOOGLE_AUTH_CONFIG.initialRegistrationPath
      ? null
      : GOOGLE_AUTH_CONFIG.initialRegistrationPath;
  }

  if (!hasCognitoIdToken) {
    return pathname === GOOGLE_AUTH_CONFIG.appLoginPath
      ? null
      : GOOGLE_AUTH_CONFIG.appLoginPath;
  }

  return isAuthPage(pathname) ? GOOGLE_AUTH_CONFIG.successPath : null;
}
