import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { createInitialRegistrationUser } from "@/features/auth/repositories/create-initial-registration-user";
import { existsUserByEmail } from "@/features/auth/repositories/exists-user-by-email";
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
    address: form.address,
    phoneNumber: form.phoneNumber,
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
