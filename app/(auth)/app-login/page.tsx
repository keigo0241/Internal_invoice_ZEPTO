import { redirect } from "next/navigation";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { getCurrentGoogleVerifiedEmail } from "@/features/auth/services/session";
import { AppLoginContent } from "./content";

export default async function AppLoginPage() {
  const googleVerifiedEmail = await getCurrentGoogleVerifiedEmail();

  if (!googleVerifiedEmail) {
    redirect(GOOGLE_AUTH_CONFIG.loginPath);
  }

  return <AppLoginContent googleVerifiedEmail={googleVerifiedEmail} />;
}
