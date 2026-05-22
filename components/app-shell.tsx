"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { UserRole } from "@/constants/roles";

type AppShellProps = {
  children: React.ReactNode;
};

type CurrentUser = {
  name: string;
  role: UserRole;
};

const currentUser: CurrentUser = {
  name: "辻井 啓悟",
  role: UserRole.User,
};

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar
        currentUserRole={currentUser.role}
        isOpen={isSidebarOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          currentUser={currentUser}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
        />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
