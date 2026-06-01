import { describe, expect, it } from "vitest";
import { LOGIN_ERROR_CODE } from "@/constants/auth";
import {
  getGoogleLoginErrorCode,
  isAllowedGoogleEmailDomain,
} from "@/features/auth/services/google-auth-policy";

describe("google auth policy", () => {
  it("allows zpt-ai.com email addresses", () => {
    expect(isAllowedGoogleEmailDomain("user@zpt-ai.com")).toBe(true);
  });

  it("normalizes email before checking the domain", () => {
    expect(isAllowedGoogleEmailDomain(" USER@ZPT-AI.COM ")).toBe(true);
  });

  it("rejects email addresses outside zpt-ai.com", () => {
    expect(isAllowedGoogleEmailDomain("user@example.com")).toBe(false);
  });

  it("returns an error code for invalid Google domains", () => {
    expect(getGoogleLoginErrorCode("user@example.com")).toBe(
      LOGIN_ERROR_CODE.invalidGoogleDomain,
    );
  });
});
