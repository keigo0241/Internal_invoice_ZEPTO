import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { createInitialRegistrationUser } from "@/features/auth/repositories/create-initial-registration-user";
import { existsUserByEmail } from "@/features/auth/repositories/exists-user-by-email";
import { type InitialRegistrationForm } from "@/features/auth/types/initial-registration";
import {
  deleteCognitoUser,
  registerCognitoUser,
} from "@/features/auth/services/cognito-user";
import { ConflictError } from "@/lib/api/errors";

type RegisterInitialUserParams = {
  googleVerifiedEmail: string;
  form: InitialRegistrationForm;
};

export async function registerInitialUser({
  googleVerifiedEmail,
  form,
}: RegisterInitialUserParams) {
  const isRegistered = await existsUserByEmail(googleVerifiedEmail);

  if (isRegistered) {
    throw new ConflictError("このメールアドレスはすでに登録されています。");
  }

  await registerCognitoUser({
    email: googleVerifiedEmail,
    password: form.password,
  });

  try {
    await createInitialRegistrationUser({
      name: form.name,
      email: googleVerifiedEmail,
      address: form.address,
      phoneNumber: form.phoneNumber,
      bankName: form.bankName,
      accountType: form.accountType,
      branchName: form.branchName,
      accountNumber: form.accountNumber,
      accountHolder: form.accountHolder,
    });
  } catch (error) {
    await deleteCognitoUser(googleVerifiedEmail).catch(() => undefined);

    throw error;
  }

  return {
    redirectPath: GOOGLE_AUTH_CONFIG.appLoginPath,
  };
}
