import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { createLogoutCookieHeaders } from "@/features/auth/services/session";
import { type ApiHandler } from "@/lib/api/types";

export const handlePost: ApiHandler = async () => {
  return {
    status: 200,
    headers: createLogoutCookieHeaders(),
    body: {
      data: {
        redirectPath: GOOGLE_AUTH_CONFIG.loginPath,
      },
    },
  };
};
