import { parseInitialRegistrationForm } from "@/features/auth/schemas/initial-registration-schema";
import { registerInitialUser } from "@/features/auth/services/initial-registration";
import { createGoogleRegistrationCompletedCookieHeader } from "@/features/auth/services/session";
import { type AuthenticatedApiHandler } from "@/lib/api/with-auth";

export const handlePost: AuthenticatedApiHandler = async (ctx) => {
  const form = parseInitialRegistrationForm(await ctx.request.json());
  const result = await registerInitialUser({
    googleVerifiedEmail: ctx.auth.googleVerifiedEmail,
    form,
  });

  return {
    status: 201,
    headers: {
      "Set-Cookie": createGoogleRegistrationCompletedCookieHeader(),
    },
    body: {
      data: result,
    },
  };
};
