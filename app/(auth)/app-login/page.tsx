import { redirect } from "next/navigation";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { getCurrentGoogleAuthSession } from "@/features/auth/services/session";
import { AppLoginContent } from "./content";

export default async function AppLoginPage() {
  const googleAuthSession = await getCurrentGoogleAuthSession();

  if (!googleAuthSession) {
    redirect(GOOGLE_AUTH_CONFIG.loginPath);
  }

  return (
    <AppLoginContent googleVerifiedEmail={googleAuthSession.googleVerifiedEmail} />
  );
}
