import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { getCurrentGoogleVerifiedEmail } from "@/features/auth/services/session";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const googleVerifiedEmail = await getCurrentGoogleVerifiedEmail();

  if (!googleVerifiedEmail) {
    redirect(GOOGLE_AUTH_CONFIG.loginPath);
  }

  return <AppShell>{children}</AppShell>;
}
