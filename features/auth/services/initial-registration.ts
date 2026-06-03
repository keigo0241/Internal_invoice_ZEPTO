import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import {
  createInitialRegistrationUser,
  existsUserByEmail,
} from "@/features/auth/repositories/user-repository";
import { type InitialRegistrationForm } from "@/features/auth/types/initial-registration";
import { hashPassword } from "@/features/auth/services/password";
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

  const passwordHash = await hashPassword(form.password);

  await createInitialRegistrationUser({
    name: form.name,
    email: googleVerifiedEmail,
    passwordHash,
    bankName: form.bankName,
    accountType: form.accountType,
    branchName: form.branchName,
    accountNumber: form.accountNumber,
    accountHolder: form.accountHolder,
  });

  return {
    redirectPath: GOOGLE_AUTH_CONFIG.appLoginPath,
  };
}
