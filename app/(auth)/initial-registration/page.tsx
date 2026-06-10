import { redirect } from "next/navigation";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { getCurrentGoogleAuthSession } from "@/features/auth/services/session";
import { InitialRegistrationContent } from "./content";

export default async function InitialRegistrationPage() {
  const googleAuthSession = await getCurrentGoogleAuthSession();

  if (!googleAuthSession) {
    redirect(GOOGLE_AUTH_CONFIG.loginPath);
  }

  return (
    <InitialRegistrationContent
      googleVerifiedEmail={googleAuthSession.googleVerifiedEmail}
    />
  );
}
