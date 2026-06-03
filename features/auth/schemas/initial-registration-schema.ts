import { BadRequestError } from "@/lib/api/errors";
import { type InitialRegistrationForm } from "@/features/auth/types/initial-registration";

const INITIAL_REGISTRATION_LIMITS = {
  name: 100,
  passwordMin: 8,
  passwordMax: 128,
  bankName: 100,
  branchName: 100,
  accountType: 20,
  accountNumber: 20,
  accountHolder: 100,
} as const;

function getStringValue(value: unknown, fieldName: string) {
  if (typeof value !== "string") {
    throw new BadRequestError(`${fieldName}を入力してください。`);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new BadRequestError(`${fieldName}を入力してください。`);
  }

  return trimmedValue;
}

function assertMaxLength(value: string, maxLength: number, fieldName: string) {
  if (value.length > maxLength) {
    throw new BadRequestError(`${fieldName}は${maxLength}文字以内で入力してください。`);
  }
}

function parseInitialRegistrationBody(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new BadRequestError("入力内容を確認してください。");
  }

  return body as Record<string, unknown>;
}

export function parseInitialRegistrationForm(body: unknown): InitialRegistrationForm {
  const values = parseInitialRegistrationBody(body);
  const name = getStringValue(values.name, "氏名");
  const password = getStringValue(values.password, "パスワード");
  const passwordConfirmation = getStringValue(
    values.passwordConfirmation,
    "パスワード確認用",
  );
  const bankName = getStringValue(values.bankName, "銀行名");
  const accountType = getStringValue(values.accountType, "預金種目");
  const branchName = getStringValue(values.branchName, "店名");
  const accountNumber = getStringValue(values.accountNumber, "口座番号");
  const accountHolder = getStringValue(values.accountHolder, "口座名義");

  assertMaxLength(name, INITIAL_REGISTRATION_LIMITS.name, "氏名");
  assertMaxLength(password, INITIAL_REGISTRATION_LIMITS.passwordMax, "パスワード");
  assertMaxLength(bankName, INITIAL_REGISTRATION_LIMITS.bankName, "銀行名");
  assertMaxLength(branchName, INITIAL_REGISTRATION_LIMITS.branchName, "店名");
  assertMaxLength(accountType, INITIAL_REGISTRATION_LIMITS.accountType, "預金種目");
  assertMaxLength(accountNumber, INITIAL_REGISTRATION_LIMITS.accountNumber, "口座番号");
  assertMaxLength(accountHolder, INITIAL_REGISTRATION_LIMITS.accountHolder, "口座名義");

  if (password.length < INITIAL_REGISTRATION_LIMITS.passwordMin) {
    throw new BadRequestError("パスワードは8文字以上で入力してください。");
  }

  if (password !== passwordConfirmation) {
    throw new BadRequestError("パスワードと確認用パスワードが一致しません。");
  }

  return {
    name,
    password,
    passwordConfirmation,
    bankName,
    accountType,
    branchName,
    accountNumber,
    accountHolder,
  };
}
