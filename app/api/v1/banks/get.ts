import { searchBanks } from "@/features/banks/services/zengin-bank-master";
import { type AuthenticatedApiHandler } from "@/features/auth/guards/with-auth";

export const handleGet: AuthenticatedApiHandler = async (ctx) => {
  const requestUrl = new URL(ctx.request.url);
  const keyword = requestUrl.searchParams.get("keyword")?.trim() ?? "";

  return {
    body: {
      data: searchBanks(keyword),
    },
  };
};
