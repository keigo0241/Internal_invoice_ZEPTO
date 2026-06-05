import { BadRequestError } from "@/lib/api/errors";
import { type InitialRegistrationForm } from "@/features/auth/types/initial-registration";
import {
  isValidBankNameByCode,
  isValidBranchNameByCode,
} from "@/features/banks/services/zengin-bank-master";
import { isBankAccountType } from "@/features/users/types/bank-account";
import {
  validateBankCodeText,
  validateBranchCodeText,
} from "@/utils/validator/banks/bank-code";
import {
  INITIAL_REGISTRATION_FIELD_LIMITS,
  validateAccountHolderText,
  validateNameText,
  validateOptionalAddressText,
} from "@/utils/validator/users/initial-registration";
import {
  validatePasswordConfirmationText,
  validatePasswordText,
} from "@/utils/validator/input/password";
import { validateOptionalPhoneText } from "@/utils/validator/input/phone";
import {
  validateFullWidthText,
  validateHalfWidthNumericText,
  validateMaxLengthText,
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

function validatePassword(rawValue: unknown) {
  const password = getStringValue(rawValue, "パスワード");

  assertValidInput(
    validatePasswordText({
      value: password,
      minLength: INITIAL_REGISTRATION_FIELD_LIMITS.passwordMin,
      maxLength: INITIAL_REGISTRATION_FIELD_LIMITS.passwordMax,
    }),
  );

  return password;
}

function validateName(rawValue: unknown) {
  const name = getStringValue(rawValue, "氏名");

  assertValidInput(validateNameText(name));

  return name;
}

function validatePasswordConfirmation(
  rawValue: unknown,
  password: string,
) {
  const passwordConfirmation = getStringValue(rawValue, "パスワード確認用");

  assertValidInput(
    validatePasswordConfirmationText(password, passwordConfirmation),
  );

  return passwordConfirmation;
}

function validatePhoneNumber(rawValue: unknown) {
  const phoneNumber = getOptionalStringValue(rawValue, "電話番号");

  assertValidInput(
    validateOptionalPhoneText(
      phoneNumber ?? "",
      INITIAL_REGISTRATION_FIELD_LIMITS.phoneNumber,
    ),
  );

  return phoneNumber;
}

function validateAddress(rawValue: unknown) {
  const address = getOptionalStringValue(rawValue, "住所");

  assertValidInput(validateOptionalAddressText(address ?? ""));

  return address;
}

function validateBankCode(rawValue: unknown) {
  const bankCode = getStringValue(rawValue, "銀行名");

  assertValidInput(validateBankCodeText(bankCode));

  return bankCode;
}

function validateBranchCode(rawValue: unknown) {
  const branchCode = getStringValue(rawValue, "店名");

  assertValidInput(validateBranchCodeText(branchCode));

  return branchCode;
}

function validateAccountHolder(rawValue: unknown) {
  const accountHolder = getStringValue(rawValue, "口座名義");

  assertValidInput(validateAccountHolderText(accountHolder));

  return accountHolder;
}

export function parseInitialRegistrationForm(body: unknown): InitialRegistrationForm {
  const values = parseInitialRegistrationBody(body);
  const name = validateName(values.name);
  const password = validatePassword(values.password);
  const passwordConfirmation = validatePasswordConfirmation(
    values.passwordConfirmation,
    password,
  );
  const address = validateAddress(values.address);
  const phoneNumber = validatePhoneNumber(values.phoneNumber);
  const bankName = getStringValue(values.bankName, "銀行名");
  const bankCode = validateBankCode(values.bankCode);
  const accountType = getStringValue(values.accountType, "預金種目");
  const branchName = getStringValue(values.branchName, "店名");
  const branchCode = validateBranchCode(values.branchCode);
  const accountNumber = getStringValue(values.accountNumber, "口座番号");
  const accountHolder = validateAccountHolder(values.accountHolder);

  assertValidInput(
    validateMaxLengthText(
      bankName,
      INITIAL_REGISTRATION_FIELD_LIMITS.bankName,
      "銀行名",
    ),
  );
  assertValidInput(validateFullWidthText(bankName, "銀行名"));

  if (!isValidBankNameByCode(bankCode, bankName)) {
    throw new BadRequestError("銀行名は候補から選択してください。");
  }

  assertValidInput(
    validateMaxLengthText(
      accountType,
      INITIAL_REGISTRATION_FIELD_LIMITS.accountType,
      "預金種目",
    ),
  );

  if (!isBankAccountType(accountType)) {
    throw new BadRequestError("預金種目を確認してください。");
  }

  assertValidInput(
    validateMaxLengthText(
      branchName,
      INITIAL_REGISTRATION_FIELD_LIMITS.branchName,
      "店名",
    ),
  );
  assertValidInput(validateFullWidthText(branchName, "店名"));

  if (!isValidBranchNameByCode({ bankCode, branchCode, branchName })) {
    throw new BadRequestError("店名は候補から選択してください。");
  }

  assertValidInput(
    validateMaxLengthText(
      accountNumber,
      INITIAL_REGISTRATION_FIELD_LIMITS.accountNumber,
      "口座番号",
    ),
  );
  assertValidInput(validateHalfWidthNumericText(accountNumber, "口座番号"));
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
