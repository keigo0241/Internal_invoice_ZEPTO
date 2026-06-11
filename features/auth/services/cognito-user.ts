import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
} from "@/lib/api/errors";
import { logger } from "@/lib/logger/logger";
import { getCognitoClient } from "@/libs/cognito";
import { getCognitoConfig } from "@/libs/cognito-config";
import { normalizeEmail } from "@/utils/validator/input/email";

type RegisterCognitoUserParams = {
  email: string;
  password: string;
};

function getCognitoErrorName(error: unknown) {
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

export async function deleteCognitoUser(username: string) {
  const cognitoClient = getCognitoClient();
  const cognitoConfig = getCognitoConfig();

  await cognitoClient.send(
    new AdminDeleteUserCommand({
      UserPoolId: cognitoConfig.userPoolId,
      Username: username,
    }),
  );
}

async function cleanupCognitoUser(username: string) {
  try {
    await deleteCognitoUser(username);
  } catch (error) {
    logger.error({
      message: "Failed to cleanup Cognito user after registration failure.",
      context: {
        username,
      },
      error,
    });
  }
}

function handleRegisterCognitoUserError(error: unknown): never {
  const errorName = getCognitoErrorName(error);

  switch (errorName) {
    case "UsernameExistsException":
      throw new ConflictError("このメールアドレスはすでに登録されています。");
    case "InvalidPasswordException":
      throw new BadRequestError("パスワードの条件を確認してください。");
    case "CredentialsProviderError":
      throw new InternalServerError("AWS認証情報を確認してください。");
    default:
      logger.error({
        message: "Unexpected Cognito user registration error.",
        context: {
          errorName,
        },
        error,
      });

      throw new InternalServerError("Cognitoユーザーを作成できませんでした。");
  }
}

export async function registerCognitoUser({
  email,
  password,
}: RegisterCognitoUserParams) {
  const normalizedEmail = normalizeEmail(email);
  const cognitoClient = getCognitoClient();
  const cognitoConfig = getCognitoConfig();
  let isUserCreated = false;

  try {
    await cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: cognitoConfig.userPoolId,
        Username: normalizedEmail,
        MessageAction: "SUPPRESS",
        UserAttributes: [
          {
            Name: "email",
            Value: normalizedEmail,
          },
          {
            Name: "email_verified",
            Value: "true",
          },
        ],
      }),
    );
    isUserCreated = true;

    await cognitoClient.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: cognitoConfig.userPoolId,
        Username: normalizedEmail,
        Password: password,
        Permanent: true,
      }),
    );
  } catch (error) {
    if (isUserCreated) {
      await cleanupCognitoUser(normalizedEmail);
    }

    handleRegisterCognitoUserError(error);
  }
}
