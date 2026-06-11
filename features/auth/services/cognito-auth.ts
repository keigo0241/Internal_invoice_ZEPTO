import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { createCognitoSecretHash } from "@/features/auth/services/cognito-secret-hash";
import { type CognitoAuthTokens } from "@/features/auth/types/app-login";
import { InternalServerError, UnauthorizedError } from "@/lib/api/errors";
import { logger } from "@/lib/logger/logger";
import { getCognitoClient } from "@/libs/cognito";
import { getCognitoConfig } from "@/libs/cognito-config";
import { normalizeEmail } from "@/utils/validator/input/email";

type AuthenticateCognitoUserParams = {
  email: string;
  password: string;
};

const COGNITO_USER_PASSWORD_AUTH_FLOW = "USER_PASSWORD_AUTH";

function getCognitoAuthErrorName(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof error.name === "string"
  ) {
    return error.name;
  }

  return null;
}

function handleAuthenticateCognitoUserError(error: unknown): never {
  const errorName = getCognitoAuthErrorName(error);

  switch (errorName) {
    case "NotAuthorizedException":
    case "UserNotFoundException":
      throw new UnauthorizedError(
        "メールアドレスまたはパスワードが正しくありません。",
      );
    case "PasswordResetRequiredException":
      throw new UnauthorizedError("パスワードの再設定が必要です。");
    case "CredentialsProviderError":
      throw new InternalServerError("AWS認証情報を確認してください。");
    default:
      logger.error({
        message: "Unexpected Cognito authentication error.",
        context: {
          errorName,
        },
        error,
      });

      throw new InternalServerError("Cognito認証に失敗しました。");
  }
}

function assertCognitoAuthTokens(value: unknown): CognitoAuthTokens {
  if (!value || typeof value !== "object") {
    throw new InternalServerError("Cognito認証情報を取得できませんでした。");
  }

  const tokens = value as Partial<{
    IdToken: string;
    AccessToken: string;
    RefreshToken: string;
  }>;

  if (!tokens.IdToken || !tokens.AccessToken || !tokens.RefreshToken) {
    throw new InternalServerError("Cognito認証情報を取得できませんでした。");
  }

  return {
    idToken: tokens.IdToken,
    accessToken: tokens.AccessToken,
    refreshToken: tokens.RefreshToken,
  };
}

export async function authenticateCognitoUser({
  email,
  password,
}: AuthenticateCognitoUserParams): Promise<CognitoAuthTokens> {
  const normalizedEmail = normalizeEmail(email);
  const cognitoClient = getCognitoClient();
  const cognitoConfig = getCognitoConfig();

  try {
    const result = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: COGNITO_USER_PASSWORD_AUTH_FLOW,
        ClientId: cognitoConfig.appClientId,
        AuthParameters: {
          USERNAME: normalizedEmail,
          PASSWORD: password,
          SECRET_HASH: createCognitoSecretHash({
            appClientId: cognitoConfig.appClientId,
            appClientSecret: cognitoConfig.appClientSecret,
            username: normalizedEmail,
          }),
        },
      }),
    );

    return assertCognitoAuthTokens(result.AuthenticationResult);
  } catch (error) {
    handleAuthenticateCognitoUserError(error);
  }
}
