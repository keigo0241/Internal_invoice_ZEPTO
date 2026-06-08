import { parseInitialRegistrationForm } from "@/features/auth/schemas/initial-registration-schema";
import { registerInitialUser } from "@/features/auth/services/initial-registration";
import { type AuthenticatedApiHandler } from "@/features/auth/guards/with-auth";

export const handlePost: AuthenticatedApiHandler = async (ctx) => {
  const form = parseInitialRegistrationForm(await ctx.request.json());
  const result = await registerInitialUser({
    googleVerifiedEmail: ctx.auth.googleVerifiedEmail,
    form,
  });

  return {
    status: 201,
    body: {
      data: result,
    },
  };
};
