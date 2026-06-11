import { parseAppLoginForm } from "@/features/auth/schemas/app-login-schema";
import { loginAppUser } from "@/features/auth/services/app-login";
import { createCognitoAuthSessionCookieHeaders } from "@/features/auth/services/session";
import { type AuthenticatedApiHandler } from "@/lib/api/with-auth";

export const handlePost: AuthenticatedApiHandler = async (ctx) => {
  const form = parseAppLoginForm(await ctx.request.json());
  const result = await loginAppUser({
    googleVerifiedEmail: ctx.auth.googleVerifiedEmail,
    form,
  });

  return {
    status: 200,
    headers: createCognitoAuthSessionCookieHeaders(result.tokens),
    body: {
      data: {
        redirectPath: result.redirectPath,
      },
    },
  };
};
