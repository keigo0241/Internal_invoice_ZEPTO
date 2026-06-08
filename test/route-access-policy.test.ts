import { describe, expect, it } from "vitest";
import {
  GOOGLE_AUTH_CONFIG,
  GOOGLE_REGISTRATION_STATUS,
} from "@/constants/auth";
import { getAuthRedirectPath } from "@/features/auth/services/route-access-policy";

describe("getAuthRedirectPath", () => {
  it("allows the Google login page when Google auth cookie is missing", () => {
    expect(
      getAuthRedirectPath({
        pathname: GOOGLE_AUTH_CONFIG.loginPath,
        hasGoogleVerifiedEmail: false,
        hasCognitoIdToken: false,
      }),
    ).toBeNull();
  });

  it("redirects every protected page to Google login when Google auth cookie is missing", () => {
    expect(
      getAuthRedirectPath({
        pathname: "/invoices",
        hasGoogleVerifiedEmail: false,
        hasCognitoIdToken: false,
      }),
    ).toBe(GOOGLE_AUTH_CONFIG.loginPath);
  });

  it("redirects to initial registration when Google auth exists but user is not registered", () => {
    expect(
      getAuthRedirectPath({
        pathname: "/invoices",
        hasGoogleVerifiedEmail: true,
        googleRegistrationStatus: GOOGLE_REGISTRATION_STATUS.unregistered,
        hasCognitoIdToken: false,
      }),
    ).toBe(GOOGLE_AUTH_CONFIG.initialRegistrationPath);
  });

  it("allows initial registration when Google auth exists but user is not registered", () => {
    expect(
      getAuthRedirectPath({
        pathname: GOOGLE_AUTH_CONFIG.initialRegistrationPath,
        hasGoogleVerifiedEmail: true,
        googleRegistrationStatus: GOOGLE_REGISTRATION_STATUS.unregistered,
        hasCognitoIdToken: false,
      }),
    ).toBeNull();
  });

  it("redirects registered Google users without Cognito token to app login", () => {
    expect(
      getAuthRedirectPath({
        pathname: "/invoices",
        hasGoogleVerifiedEmail: true,
        googleRegistrationStatus: GOOGLE_REGISTRATION_STATUS.registered,
        hasCognitoIdToken: false,
      }),
    ).toBe(GOOGLE_AUTH_CONFIG.appLoginPath);
  });

  it("allows app pages when both Google auth and Cognito token exist", () => {
    expect(
      getAuthRedirectPath({
        pathname: "/invoices",
        hasGoogleVerifiedEmail: true,
        googleRegistrationStatus: GOOGLE_REGISTRATION_STATUS.registered,
        hasCognitoIdToken: true,
      }),
    ).toBeNull();
  });

  it("redirects logged-in users away from auth pages", () => {
    expect(
      getAuthRedirectPath({
        pathname: GOOGLE_AUTH_CONFIG.appLoginPath,
        hasGoogleVerifiedEmail: true,
        googleRegistrationStatus: GOOGLE_REGISTRATION_STATUS.registered,
        hasCognitoIdToken: true,
      }),
    ).toBe(GOOGLE_AUTH_CONFIG.successPath);
  });
});
