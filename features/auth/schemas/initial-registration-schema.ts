import { BadRequestError } from "@/lib/api/errors";
import { type InitialRegistrationForm } from "@/features/auth/types/initial-registration";
import {
  isValidBankNameByCode,
  isValidBranchNameByCode,
} from "@/features/banks/services/zengin-bank-master";
import { isBankAccountType } from "@/features/users/types/bank-account";
import { USER_FIELD_LIMITS } from "@/utils/validator/users/user-field-rules";
import {
  validatePasswordConfirmationText,
  validatePasswordText,
} from "@/utils/validator/input/password";
import { validateOptionalPhoneText } from "@/utils/validator/input/phone";
import {
  validateFullWidthText,
  validateHalfWidthNumericText,
  validateMaxLengthText,
  validateOptionalMaxLengthText,
} from "@/utils/validator/input/text";

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

function getOptionalStringValue(value: unknown, fieldName: string) {
  if (value === null || typeof value === "undefined") {
    return null;
  }

  if (typeof value !== "string") {
    throw new BadRequestError(`${fieldName}を確認してください。`);
  }

  const trimmedValue = value.trim();

  return trimmedValue || null;
}

function parseInitialRegistrationBody(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new BadRequestError("入力内容を確認してください。");
  }

  return body as Record<string, unknown>;
}

function assertValidInput(errorMessage: string | null) {
  if (errorMessage) {
    throw new BadRequestError(errorMessage);
  }
}

export function parseInitialRegistrationForm(body: unknown): InitialRegistrationForm {
  const values = parseInitialRegistrationBody(body);
  const name = getStringValue(values.name, "氏名");
  const password = getStringValue(values.password, "パスワード");
  const passwordConfirmation = getStringValue(
    values.passwordConfirmation,
    "パスワード確認用",
  );
  const address = getOptionalStringValue(values.address, "住所");
  const phoneNumber = getOptionalStringValue(values.phoneNumber, "電話番号");
  const bankName = getStringValue(values.bankName, "銀行名");
  const bankCode = getStringValue(values.bankCode, "銀行名");
  const accountType = getStringValue(values.accountType, "預金種目");
  const branchName = getStringValue(values.branchName, "店名");
  const branchCode = getStringValue(values.branchCode, "店名");
  const accountNumber = getStringValue(values.accountNumber, "口座番号");
  const accountHolder = getStringValue(values.accountHolder, "口座名義");

  assertValidInput(validateMaxLengthText(name, USER_FIELD_LIMITS.name, "氏名"));
  assertValidInput(
    validatePasswordText({
      value: password,
      fieldName: "パスワード",
      minLength: USER_FIELD_LIMITS.passwordMin,
      maxLength: USER_FIELD_LIMITS.passwordMax,
    }),
  );
  assertValidInput(
    validatePasswordConfirmationText(
      password,
      passwordConfirmation,
      "パスワード確認用",
    ),
  );
  assertValidInput(
    validateOptionalMaxLengthText(address ?? "", USER_FIELD_LIMITS.address, "住所"),
  );
  assertValidInput(
    validateOptionalPhoneText(
      phoneNumber ?? "",
      USER_FIELD_LIMITS.phoneNumber,
      "電話番号",
    ),
  );
  assertValidInput(
    validateMaxLengthText(bankName, USER_FIELD_LIMITS.bankName, "銀行名"),
  );
  assertValidInput(validateFullWidthText(bankName, "銀行名"));

  if (!isValidBankNameByCode(bankCode, bankName)) {
    throw new BadRequestError("銀行名は候補から選択してください。");
  }

  assertValidInput(
    validateMaxLengthText(accountType, USER_FIELD_LIMITS.accountType, "預金種目"),
  );

  if (!isBankAccountType(accountType)) {
    throw new BadRequestError("預金種目を確認してください。");
  }

  assertValidInput(
    validateMaxLengthText(branchName, USER_FIELD_LIMITS.branchName, "店名"),
  );
  assertValidInput(validateFullWidthText(branchName, "店名"));

  if (!isValidBranchNameByCode({ bankCode, branchCode, branchName })) {
    throw new BadRequestError("店名は候補から選択してください。");
  }

  assertValidInput(
    validateMaxLengthText(
      accountNumber,
      USER_FIELD_LIMITS.accountNumber,
      "口座番号",
    ),
  );
  assertValidInput(validateHalfWidthNumericText(accountNumber, "口座番号"));
  assertValidInput(
    validateMaxLengthText(
      accountHolder,
      USER_FIELD_LIMITS.accountHolder,
      "口座名義",
    ),
  );
  assertValidInput(validateFullWidthText(accountHolder, "口座名義"));

  return {
    name,
    password,
    passwordConfirmation,
    address,
    phoneNumber,
    bankName,
    accountType,
    branchName,
    accountNumber,
    accountHolder,
  };
}
