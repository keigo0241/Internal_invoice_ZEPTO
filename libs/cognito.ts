import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { getCognitoConfig } from "@/libs/cognito-config";

type GlobalWithCognitoClient = typeof globalThis & {
  cognitoClient?: CognitoIdentityProviderClient;
};

function createCognitoClient() {
  const globalWithCognitoClient = globalThis as GlobalWithCognitoClient;

  if (!globalWithCognitoClient.cognitoClient) {
    globalWithCognitoClient.cognitoClient = new CognitoIdentityProviderClient({
      region: getCognitoConfig().region,
    });
  }

  return globalWithCognitoClient.cognitoClient;
}

export function getCognitoClient() {
  return createCognitoClient();
}
