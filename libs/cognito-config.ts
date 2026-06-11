import { getRequiredEnv } from "@/libs/server/env/get-required-env";

const COGNITO_ENV_KEYS = {
  region: "COGNITO_REGION",
  userPoolId: "COGNITO_USER_POOL_ID",
  appClientId: "COGNITO_APP_CLIENT_ID",
  appClientSecret: "COGNITO_APP_CLIENT_SECRET",
} as const;

export type CognitoConfig = {
  region: string;
  userPoolId: string;
  appClientId: string;
  appClientSecret: string;
};

export type CognitoTokenVerificationConfig = Pick<
  CognitoConfig,
  "region" | "userPoolId" | "appClientId"
>;

export function getCognitoConfig(): CognitoConfig {
  return {
    region: getRequiredEnv(COGNITO_ENV_KEYS.region),
    userPoolId: getRequiredEnv(COGNITO_ENV_KEYS.userPoolId),
    appClientId: getRequiredEnv(COGNITO_ENV_KEYS.appClientId),
    appClientSecret: getRequiredEnv(COGNITO_ENV_KEYS.appClientSecret),
  };
}

export function getCognitoTokenVerificationConfig(): CognitoTokenVerificationConfig {
  return {
    region: getRequiredEnv(COGNITO_ENV_KEYS.region),
    userPoolId: getRequiredEnv(COGNITO_ENV_KEYS.userPoolId),
    appClientId: getRequiredEnv(COGNITO_ENV_KEYS.appClientId),
  };
}
