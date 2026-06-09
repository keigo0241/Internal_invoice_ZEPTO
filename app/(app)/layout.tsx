import { AppShell } from "@/components/app-shell";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
