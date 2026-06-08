import { searchBanks } from "@/features/banks/services/zengin-bank-master";
import { type AuthenticatedApiHandler } from "@/lib/api/with-auth";

export const handleGet: AuthenticatedApiHandler = async (ctx) => {
  const requestUrl = new URL(ctx.request.url);
  const normalizedKeyword = requestUrl.searchParams.get("keyword")?.trim() ?? "";

  return {
    body: {
      data: searchBanks(normalizedKeyword),
    },
  };
};
