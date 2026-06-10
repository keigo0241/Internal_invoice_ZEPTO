import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { getRequiredEnv } from "@/libs/server/env/get-required-env";

const COGNITO_ENV_KEYS = {
  region: "COGNITO_REGION",
  userPoolId: "COGNITO_USER_POOL_ID",
  appClientId: "COGNITO_APP_CLIENT_ID",
  appClientSecret: "COGNITO_APP_CLIENT_SECRET",
} as const;

type CognitoConfig = {
  region: string;
  userPoolId: string;
  appClientId: string;
  appClientSecret: string;
};

type GlobalWithCognitoClient = typeof globalThis & {
  cognitoClient?: CognitoIdentityProviderClient;
};

export function getCognitoConfig(): CognitoConfig {
  return {
    region: getRequiredEnv(COGNITO_ENV_KEYS.region),
    userPoolId: getRequiredEnv(COGNITO_ENV_KEYS.userPoolId),
    appClientId: getRequiredEnv(COGNITO_ENV_KEYS.appClientId),
    appClientSecret: getRequiredEnv(COGNITO_ENV_KEYS.appClientSecret),
  };
}

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
