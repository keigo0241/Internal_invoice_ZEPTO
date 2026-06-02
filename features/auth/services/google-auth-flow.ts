import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { existsUserByEmail } from "@/features/auth/repositories/user-repository";

export async function getGoogleAuthNextPath(email: string) {
  const isRegistered = await existsUserByEmail(email);

  return isRegistered
    ? GOOGLE_AUTH_CONFIG.appLoginPath
    : GOOGLE_AUTH_CONFIG.initialRegistrationPath;
}
