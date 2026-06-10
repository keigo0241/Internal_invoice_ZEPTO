import { describe, expect, it } from "vitest";
import { hasValidCognitoAuthSessionToken } from "@/features/auth/services/session";

function encodeBase64Url(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function createTestJwt(payload: unknown) {
  return `${encodeBase64Url({ alg: "none" })}.${encodeBase64Url(payload)}.signature`;
}

describe("hasValidCognitoAuthSessionToken", () => {
  it("returns true when Cognito token exp is in the future", () => {
    const token = createTestJwt({
      exp: Math.floor(Date.now() / 1000) + 60,
    });

    expect(hasValidCognitoAuthSessionToken(token)).toBe(true);
  });

  it("returns false when Cognito token exp is expired", () => {
    const token = createTestJwt({
      exp: Math.floor(Date.now() / 1000) - 60,
    });

    expect(hasValidCognitoAuthSessionToken(token)).toBe(false);
  });

  it("returns false when Cognito token is invalid", () => {
    expect(hasValidCognitoAuthSessionToken("invalid-token")).toBe(false);
  });
});
