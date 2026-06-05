import isLength from "validator/lib/isLength";
import isNumeric from "validator/lib/isNumeric";

export function validateBankCodeText(bankCode: string) {
  const normalizedBankCode = bankCode.trim();

  if (
    !isNumeric(normalizedBankCode) ||
    !isLength(normalizedBankCode, { min: 4, max: 4 })
  ) {
    return "銀行コードを確認してください。";
  }

  return null;
}

export function validateBranchCodeText(branchCode: string) {
  const normalizedBranchCode = branchCode.trim();

  if (
    !isNumeric(normalizedBranchCode) ||
    !isLength(normalizedBranchCode, { min: 3, max: 3 })
  ) {
    return "店番号を確認してください。";
  }

  return null;
}
