import { BadRequestError } from "@/lib/api/errors";
import { type ApiGuard } from "@/lib/api/types";

export const requireJsonRequestGuard: ApiGuard = (ctx) => {
  const contentType = ctx.request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new BadRequestError("リクエスト形式を確認してください。");
  }
};
