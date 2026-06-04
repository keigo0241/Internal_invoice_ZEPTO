import { searchBankBranches } from "@/features/banks/services/zengin-bank-master";
import { type AuthenticatedApiHandler } from "@/features/auth/guards/with-auth";
import { BadRequestError } from "@/lib/api/errors";

export const handleGet: AuthenticatedApiHandler = async (ctx) => {
  const bankCode = ctx.params?.bankCode;

  if (!bankCode) {
    throw new BadRequestError("銀行コードを確認してください。");
  }

  const requestUrl = new URL(ctx.request.url);
  const keyword = requestUrl.searchParams.get("keyword");

  return {
    body: {
      data: searchBankBranches(bankCode, keyword),
    },
  };
};
