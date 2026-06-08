import { createHmac } from "node:crypto";

type CreateCognitoSecretHashParams = {
  appClientId: string;
  appClientSecret: string;
  username: string;
};

export function createCognitoSecretHash({
  appClientId,
  appClientSecret,
  username,
}: CreateCognitoSecretHashParams) {
  return createHmac("sha256", appClientSecret)
    .update(`${username}${appClientId}`)
    .digest("base64");
}
