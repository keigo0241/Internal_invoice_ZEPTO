import { BadRequestError } from "@/lib/api/errors";
import { type InitialRegistrationForm } from "@/features/auth/types/initial-registration";
import {
  isFullWidthText,
  isHalfWidthAlphanumeric,
  isHalfWidthNumeric,
  USER_FIELD_LIMITS,
} from "@/features/users/types/user-field-rules";

const ACCOUNT_TYPE_VALUES = ["ordinary", "checking", "savings"] as const;

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

  assertMaxLength(name, USER_FIELD_LIMITS.name, "氏名");
  assertMaxLength(password, USER_FIELD_LIMITS.passwordMax, "パスワード");
  assertMaxLength(bankName, USER_FIELD_LIMITS.bankName, "銀行名");
  assertMaxLength(branchName, USER_FIELD_LIMITS.branchName, "店名");
  assertMaxLength(accountType, USER_FIELD_LIMITS.accountType, "預金種目");
  assertMaxLength(accountNumber, USER_FIELD_LIMITS.accountNumber, "口座番号");
  assertMaxLength(accountHolder, USER_FIELD_LIMITS.accountHolder, "口座名義");

  if (password.length < USER_FIELD_LIMITS.passwordMin) {
    throw new BadRequestError("パスワードは8文字以上で入力してください。");
  }

  if (!isHalfWidthAlphanumeric(password)) {
    throw new BadRequestError("パスワードは半角英数字のみで入力してください。");
  }

  if (password !== passwordConfirmation) {
    throw new BadRequestError("パスワードと確認用パスワードが一致しません。");
  }

  if (!isFullWidthText(bankName)) {
    throw new BadRequestError("銀行名は全角で入力してください。");
  }

  if (!ACCOUNT_TYPE_VALUES.includes(accountType as (typeof ACCOUNT_TYPE_VALUES)[number])) {
    throw new BadRequestError("預金種目を確認してください。");
  }

  if (!isFullWidthText(branchName)) {
    throw new BadRequestError("店名は全角で入力してください。");
  }

  if (!isHalfWidthNumeric(accountNumber)) {
    throw new BadRequestError("口座番号は半角数字のみで入力してください。");
  }

  if (!isFullWidthText(accountHolder)) {
    throw new BadRequestError("口座名義は全角で入力してください。");
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
