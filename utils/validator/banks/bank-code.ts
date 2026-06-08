import isLength from "validator/lib/isLength";
import isNumeric from "validator/lib/isNumeric";

export type BankCodeValidationErrorCode =
  | "invalidBankCode"
  | "invalidBranchCode";

export function validateBankCodeText(bankCode: string): BankCodeValidationErrorCode | null {
  const normalizedBankCode = bankCode.trim();

  if (
    !isNumeric(normalizedBankCode) ||
    !isLength(normalizedBankCode, { min: 4, max: 4 })
  ) {
    return "invalidBankCode";
  }

  return null;
}

export function validateBranchCodeText(branchCode: string): BankCodeValidationErrorCode | null {
  const normalizedBranchCode = branchCode.trim();

  if (
    !isNumeric(normalizedBranchCode) ||
    !isLength(normalizedBranchCode, { min: 3, max: 3 })
  ) {
    return "invalidBranchCode";
  }

  return null;
}
