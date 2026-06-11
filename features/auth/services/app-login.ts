import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { existsUserByEmail } from "@/features/auth/repositories/exists-user-by-email";
import { authenticateCognitoUser } from "@/features/auth/services/cognito-auth";
import {
  type AppLoginForm,
  type CognitoAuthTokens,
} from "@/features/auth/types/app-login";
import { ForbiddenError, NotFoundError } from "@/lib/api/errors";
import { normalizeEmail } from "@/utils/validator/input/email";

type LoginAppUserParams = {
  googleVerifiedEmail: string;
  form: AppLoginForm;
};

type LoginAppUserResult = {
  redirectPath: string;
  tokens: CognitoAuthTokens;
};

export async function loginAppUser({
  googleVerifiedEmail,
  form,
}: LoginAppUserParams): Promise<LoginAppUserResult> {
  const normalizedGoogleVerifiedEmail = normalizeEmail(googleVerifiedEmail);
  const normalizedLoginEmail = normalizeEmail(form.email);

  if (normalizedGoogleVerifiedEmail !== normalizedLoginEmail) {
    throw new ForbiddenError(
      "Google認証したメールアドレスでログインしてください。",
    );
  }

  const isRegistered = await existsUserByEmail(normalizedLoginEmail);

  if (!isRegistered) {
    throw new NotFoundError("初回登録を行ってください。");
  }

  const tokens = await authenticateCognitoUser({
    email: normalizedLoginEmail,
    password: form.password,
  });

  return {
    redirectPath: GOOGLE_AUTH_CONFIG.successPath,
    tokens,
  };
}
