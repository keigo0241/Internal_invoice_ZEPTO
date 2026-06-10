import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createCognitoSecretHash } from "@/features/auth/services/cognito-secret-hash";

describe("createCognitoSecretHash", () => {
  it("creates a base64 encoded HMAC-SHA256 hash from username and app client id", () => {
    const params = {
      appClientId: "client-id",
      appClientSecret: "client-secret",
      username: "k.tsujii@zpt-ai.com",
    };
    const expected = createHmac("sha256", params.appClientSecret)
      .update(`${params.username}${params.appClientId}`)
      .digest("base64");

    expect(createCognitoSecretHash(params)).toBe(expected);
  });
});
