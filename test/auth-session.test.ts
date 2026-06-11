import {
  createPrivateKey,
  createSign,
  generateKeyPairSync,
  type KeyObject,
} from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hasValidCognitoAuthSessionToken } from "@/features/auth/services/session";

const testRegion = "ap-southeast-2";
const testUserPoolId = "ap-southeast-2_test";
const testAppClientId = "test-app-client-id";
const testIssuer = `https://cognito-idp.${testRegion}.amazonaws.com/${testUserPoolId}`;
const testKeyId = "test-key-id";

function encodeBase64Url(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function createSignedJwt(payload: unknown, privateKey: KeyObject) {
  const encodedHeader = encodeBase64Url({
    alg: "RS256",
    kid: testKeyId,
  });
  const encodedPayload = encodeBase64Url(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createSign("RSA-SHA256")
    .update(signingInput)
    .sign(privateKey)
    .toString("base64url");

  return `${signingInput}.${signature}`;
}

describe("hasValidCognitoAuthSessionToken", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.stubEnv("COGNITO_REGION", testRegion);
    vi.stubEnv("COGNITO_USER_POOL_ID", testUserPoolId);
    vi.stubEnv("COGNITO_APP_CLIENT_ID", testAppClientId);
  });

  it("returns true when Cognito token signature and claims are valid", async () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
    });
    const jwk = publicKey.export({ format: "jwk" });
    const token = createSignedJwt({
      aud: testAppClientId,
      exp: Math.floor(Date.now() / 1000) + 60,
      iss: testIssuer,
      token_use: "id",
    }, createPrivateKey(privateKey.export({ format: "pem", type: "pkcs8" })));

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          keys: [
            {
              ...jwk,
              kid: testKeyId,
              kty: "RSA",
            },
          ],
        }),
      })),
    );

    await expect(hasValidCognitoAuthSessionToken(token)).resolves.toBe(true);
  });

  it("returns false when Cognito token exp is expired", async () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
    });
    const jwk = publicKey.export({ format: "jwk" });
    const token = createSignedJwt({
      aud: testAppClientId,
      exp: Math.floor(Date.now() / 1000) - 60,
      iss: testIssuer,
      token_use: "id",
    }, privateKey);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          keys: [
            {
              ...jwk,
              kid: testKeyId,
              kty: "RSA",
            },
          ],
        }),
      })),
    );

    await expect(hasValidCognitoAuthSessionToken(token)).resolves.toBe(false);
  });

  it("returns false when Cognito token is invalid", async () => {
    await expect(hasValidCognitoAuthSessionToken("invalid-token")).resolves.toBe(
      false,
    );
  });
});
