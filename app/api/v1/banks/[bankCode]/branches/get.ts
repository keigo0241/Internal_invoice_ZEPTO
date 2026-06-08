import { searchBankBranches } from "@/features/banks/services/zengin-bank-master";
import { type AuthenticatedApiHandler } from "@/features/auth/guards/with-auth";
import { BadRequestError } from "@/lib/api/errors";
import { validateBankCodeText } from "@/utils/validator/banks/bank-code";

export const handleGet: AuthenticatedApiHandler = async (ctx) => {
  const bankCode = ctx.params?.bankCode?.trim() ?? "";

  const bankCodeError = validateBankCodeText(bankCode, "銀行コード");

  if (bankCodeError) {
    throw new BadRequestError(bankCodeError);
  }

  const requestUrl = new URL(ctx.request.url);
  const keyword = requestUrl.searchParams.get("keyword")?.trim() ?? "";

  return {
    body: {
      data: searchBankBranches(bankCode, keyword),
    },
  };
};
