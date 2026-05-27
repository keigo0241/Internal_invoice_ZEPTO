import { redirect } from "next/navigation";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  void children;

  redirect(GOOGLE_AUTH_CONFIG.loginPath);
}
