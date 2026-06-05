import { searchBankBranches } from "@/features/banks/services/zengin-bank-master";
import { BadRequestError } from "@/lib/api/errors";
import { type AuthenticatedApiHandler } from "@/lib/api/with-auth";
import { validateBankCodeText } from "@/utils/validator/banks/bank-code";

function parseBankCode(value: string | undefined) {
  const bankCode = value?.trim() ?? "";
  const bankCodeError = validateBankCodeText(bankCode);

  if (bankCodeError) {
    throw new BadRequestError(bankCodeError);
  }

  return bankCode;
}

export const handleGet: AuthenticatedApiHandler = async (ctx) => {
  const bankCode = parseBankCode(ctx.params?.bankCode);

  const requestUrl = new URL(ctx.request.url);
  const keyword = requestUrl.searchParams.get("keyword")?.trim() ?? "";

  return {
    body: {
      data: searchBankBranches(bankCode, keyword),
    },
  };
};
