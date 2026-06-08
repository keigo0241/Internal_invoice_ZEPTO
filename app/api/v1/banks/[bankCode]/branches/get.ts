import { searchBankBranches } from "@/features/banks/services/zengin-bank-master";
import { BadRequestError } from "@/lib/api/errors";
import { type AuthenticatedApiHandler } from "@/lib/api/with-auth";
import { validateBankCodeText } from "@/utils/validator/banks/bank-code";

function parseBankCode(value: string | undefined) {
  const normalizedBankCode = value?.trim() ?? "";
  const bankCodeError = validateBankCodeText(normalizedBankCode);

  if (bankCodeError) {
    throw new BadRequestError("銀行コードを確認してください。");
  }

  return normalizedBankCode;
}

export const handleGet: AuthenticatedApiHandler = async (ctx) => {
  const bankCode = parseBankCode(ctx.params?.bankCode);

  const requestUrl = new URL(ctx.request.url);
  const normalizedKeyword = requestUrl.searchParams.get("keyword")?.trim() ?? "";

  return {
    body: {
      data: searchBankBranches(bankCode, normalizedKeyword),
    },
  };
};
