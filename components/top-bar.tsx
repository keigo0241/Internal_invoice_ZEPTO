"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { USER_ROLE_LABELS, type UserRole } from "@/constants/roles";
import { getDefaultPageTitle, getPageTitle } from "@/constants/navigation";

type CurrentUser = {
  name: string;
  role: UserRole;
};

type TopBarProps = {
  currentUser: CurrentUser;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

function PageTitle() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return <h2 className="text-xl font-semibold text-white">{pageTitle}</h2>;
}

export function TopBar({
  currentUser,
  isSidebarOpen,
  onToggleSidebar,
}: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/20 bg-sky-800 px-6 text-white">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-white/30 text-white transition hover:bg-sky-700"
        >
          <span className="flex flex-col gap-1">
            <span className="block h-0.5 w-5 rounded bg-current" />
            <span className="block h-0.5 w-5 rounded bg-current" />
            <span className="block h-0.5 w-5 rounded bg-current" />
          </span>
        </button>

        <Suspense fallback={<h2 className="text-xl font-semibold text-white">{getDefaultPageTitle()}</h2>}>
          <PageTitle />
        </Suspense>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold text-white">{currentUser.name}</p>
        <p className="text-xs text-sky-100">{USER_ROLE_LABELS[currentUser.role]}</p>
      </div>
    </header>
  );
}
