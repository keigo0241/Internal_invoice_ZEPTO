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

export async function registerCognitoUser({
  email,
  password,
}: RegisterCognitoUserParams) {
  const normalizedEmail = normalizeEmail(email);
  const cognitoClient = getCognitoClient();
  const cognitoConfig = getCognitoConfig();

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

    await cognitoClient.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: cognitoConfig.userPoolId,
        Username: normalizedEmail,
        Password: password,
        Permanent: true,
      }),
    );
  } catch (error) {
    if (isCognitoError(error, "UsernameExistsException")) {
      throw new ConflictError("このメールアドレスはすでに登録されています。");
    }

    if (isCognitoError(error, "InvalidPasswordException")) {
      await deleteCognitoUser(normalizedEmail).catch(() => undefined);

      throw new BadRequestError("パスワードの条件を確認してください。");
    }

    if (!isCognitoError(error, "UserNotFoundException")) {
      await deleteCognitoUser(normalizedEmail).catch(() => undefined);
    }

    throw new InternalServerError("Cognitoユーザーを作成できませんでした。");
  }
}
