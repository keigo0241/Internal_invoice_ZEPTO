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
import { getCognitoClient, getCognitoConfig } from "@/libs/cognito";
import { normalizeEmail } from "@/utils/validator/input/email";

type RegisterCognitoUserParams = {
  email: string;
  password: string;
};

function isCognitoError(error: unknown, name: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === name
  );
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
  if (isCognitoError(error, "UsernameExistsException")) {
    throw new ConflictError("このメールアドレスはすでに登録されています。");
  }

  if (isCognitoError(error, "InvalidPasswordException")) {
    throw new BadRequestError("パスワードの条件を確認してください。");
  }

  throw new InternalServerError("Cognitoユーザーを作成できませんでした。");
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
