import { getGoogleVerifiedEmailFromRequest } from "@/features/auth/services/session";
import {
  type ApiContext,
  type ApiGuard,
  type ApiHandlerResult,
} from "@/lib/api/types";
import { UnauthorizedError } from "@/lib/api/errors";
import { runGuards } from "@/lib/api/pipeline";
import { withApi } from "@/lib/api/with-api";

export type AuthenticatedApiContext = ApiContext & {
  auth: {
    googleVerifiedEmail: string;
  };
};

export type AuthenticatedApiHandler = (
  ctx: AuthenticatedApiContext,
) => Promise<ApiHandlerResult>;

export function withAuth(
  handler: AuthenticatedApiHandler,
  guards: ApiGuard[] = [],
) {
  return withApi(async (ctx) => {
    const googleVerifiedEmail = getGoogleVerifiedEmailFromRequest(ctx.request);

    if (!googleVerifiedEmail) {
      throw new UnauthorizedError("Google認証からやり直してください。");
    }

    const authenticatedCtx = {
      ...ctx,
      auth: {
        googleVerifiedEmail,
      },
    };
    const guardResult = await runGuards(authenticatedCtx, guards);

    if (typeof guardResult !== "undefined") {
      return guardResult;
    }

    return handler(authenticatedCtx);
  });
}
