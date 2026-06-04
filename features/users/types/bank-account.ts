export enum BankAccountType {
  Ordinary = "ordinary",
  Checking = "checking",
  Savings = "savings",
}

export const BANK_ACCOUNT_TYPE_VALUES = [
  BankAccountType.Ordinary,
  BankAccountType.Checking,
  BankAccountType.Savings,
] as const;

export function isBankAccountType(value: string): value is BankAccountType {
  return BANK_ACCOUNT_TYPE_VALUES.some((accountType) => accountType === value);
}
