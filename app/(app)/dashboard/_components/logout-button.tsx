"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { jp } from "@/assets/translations/jp";
import { Button } from "@/components/ui/button";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";

type LogoutResponse = {
  data?: {
    redirectPath?: string;
  };
  message?: string;
};

async function parseLogoutResponse(response: Response) {
  try {
    return (await response.json()) as LogoutResponse;
  } catch {
    return {};
  }
}

export function LogoutButton() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setErrorMessage(null);
    setIsLoggingOut(true);

    try {
      const response = await fetch(GOOGLE_AUTH_CONFIG.logoutApiPath, {
        method: "POST",
      });
      const result = await parseLogoutResponse(response);

      if (!response.ok) {
        setErrorMessage(result.message ?? jp.dashboard.logoutError);
        setIsLoggingOut(false);

        return;
      }

      router.push(result.data?.redirectPath ?? GOOGLE_AUTH_CONFIG.loginPath);
    } catch {
      setErrorMessage(jp.dashboard.logoutError);
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={isLoggingOut}
        onClick={handleLogout}
        className="h-10 rounded-md border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
      >
        <LogOut aria-hidden="true" className="size-4" />
        {isLoggingOut ? jp.dashboard.loggingOutButton : jp.dashboard.logoutButton}
      </Button>

      {errorMessage ? (
        <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
      ) : null}
    </div>
  );
}
