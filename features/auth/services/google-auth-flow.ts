import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { existsUserByEmail } from "@/features/auth/repositories/exists-user-by-email";

export type GoogleAuthNextStep = {
  isRegistered: boolean;
  nextPath: string;
};

export async function getGoogleAuthNextStep(
  email: string,
): Promise<GoogleAuthNextStep> {
  const isRegistered = await existsUserByEmail(email);

  return {
    isRegistered,
    nextPath: isRegistered
      ? GOOGLE_AUTH_CONFIG.appLoginPath
      : GOOGLE_AUTH_CONFIG.initialRegistrationPath,
  };
}
