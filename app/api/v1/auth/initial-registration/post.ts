import { parseInitialRegistrationForm } from "@/features/auth/schemas/initial-registration-schema";
import { registerInitialUser } from "@/features/auth/services/initial-registration";
import { getGoogleVerifiedEmailFromRequest } from "@/features/auth/services/session";
import { BadRequestError, UnauthorizedError } from "@/lib/api/errors";
import { type ApiHandler } from "@/lib/api/types";

export const handlePost: ApiHandler = async (ctx) => {
  const googleVerifiedEmail = getGoogleVerifiedEmailFromRequest(ctx.request);

  if (!googleVerifiedEmail) {
    throw new UnauthorizedError("Google認証からやり直してください。");
  }

  const contentType = ctx.request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new BadRequestError("リクエスト形式を確認してください。");
  }

  const form = parseInitialRegistrationForm(await ctx.request.json());
  const result = await registerInitialUser({
    googleVerifiedEmail,
    form,
  });

  return {
    status: 201,
    body: {
      data: result,
    },
  };
};
