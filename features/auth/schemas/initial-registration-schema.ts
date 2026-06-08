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
  type InitialRegistrationFieldName,
  type InitialRegistrationValidationErrorCode,
  validateAccountHolderText,
  validateNameText,
  validateOptionalAddressText,
} from "@/utils/validator/users/initial-registration";
import { getInitialRegistrationValidationMessage } from "@/utils/validator/users/initial-registration-validation-messages";
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

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new BadRequestError(`${fieldName}を入力してください。`);
  }

  return normalizedValue;
}

function getOptionalStringValue(value: unknown, fieldName: string) {
  if (value === null || typeof value === "undefined") {
    return null;
  }

  if (typeof value !== "string") {
    throw new BadRequestError(`${fieldName}を確認してください。`);
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function parseInitialRegistrationBody(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new BadRequestError("入力内容を確認してください。");
  }

  return body as Record<string, unknown>;
}

function assertValidInput(
  fieldName: InitialRegistrationFieldName,
  errorCode: InitialRegistrationValidationErrorCode | null,
) {
  if (errorCode) {
    throw new BadRequestError(
      getInitialRegistrationValidationMessage(fieldName, errorCode),
    );
  }
}

function validatePassword(rawValue: unknown) {
  const normalizedPassword = getStringValue(rawValue, "パスワード");

  assertValidInput(
    "password",
    validatePasswordText({
      value: normalizedPassword,
      minLength: INITIAL_REGISTRATION_FIELD_LIMITS.passwordMin,
      maxLength: INITIAL_REGISTRATION_FIELD_LIMITS.passwordMax,
    }),
  );

  return normalizedPassword;
}

function validateName(rawValue: unknown) {
  const normalizedName = getStringValue(rawValue, "氏名");

  assertValidInput("name", validateNameText(normalizedName));

  return normalizedName;
}

function validatePasswordConfirmation(
  rawValue: unknown,
  password: string,
) {
  const normalizedPasswordConfirmation = getStringValue(
    rawValue,
    "パスワード確認用",
  );

  assertValidInput(
    "passwordConfirmation",
    validatePasswordConfirmationText(password, normalizedPasswordConfirmation),
  );

  return normalizedPasswordConfirmation;
}

function validatePhoneNumber(rawValue: unknown) {
  const normalizedPhoneNumber = getOptionalStringValue(rawValue, "電話番号");

  assertValidInput(
    "phoneNumber",
    validateOptionalPhoneText(
      normalizedPhoneNumber ?? "",
      INITIAL_REGISTRATION_FIELD_LIMITS.phoneNumber,
    ),
  );

  return normalizedPhoneNumber;
}

function validateAddress(rawValue: unknown) {
  const normalizedAddress = getOptionalStringValue(rawValue, "住所");

  assertValidInput(
    "address",
    validateOptionalAddressText(normalizedAddress ?? ""),
  );

  return normalizedAddress;
}

function validateBankCode(rawValue: unknown) {
  const normalizedBankCode = getStringValue(rawValue, "銀行名");

  assertValidInput("bankCode", validateBankCodeText(normalizedBankCode));

  return normalizedBankCode;
}

function validateBranchCode(rawValue: unknown) {
  const normalizedBranchCode = getStringValue(rawValue, "店名");

  assertValidInput("branchCode", validateBranchCodeText(normalizedBranchCode));

  return normalizedBranchCode;
}

function validateAccountHolder(rawValue: unknown) {
  const normalizedAccountHolder = getStringValue(rawValue, "口座名義");

  assertValidInput(
    "accountHolder",
    validateAccountHolderText(normalizedAccountHolder),
  );

  return normalizedAccountHolder;
}

export function parseInitialRegistrationForm(body: unknown): InitialRegistrationForm {
  const values = parseInitialRegistrationBody(body);
  const normalizedName = validateName(values.name);
  const normalizedPassword = validatePassword(values.password);
  const normalizedPasswordConfirmation = validatePasswordConfirmation(
    values.passwordConfirmation,
    normalizedPassword,
  );
  const normalizedAddress = validateAddress(values.address);
  const normalizedPhoneNumber = validatePhoneNumber(values.phoneNumber);
  const normalizedBankName = getStringValue(values.bankName, "銀行名");
  const normalizedBankCode = validateBankCode(values.bankCode);
  const normalizedAccountType = getStringValue(values.accountType, "預金種目");
  const normalizedBranchName = getStringValue(values.branchName, "店名");
  const normalizedBranchCode = validateBranchCode(values.branchCode);
  const normalizedAccountNumber = getStringValue(
    values.accountNumber,
    "口座番号",
  );
  const normalizedAccountHolder = validateAccountHolder(values.accountHolder);

  assertValidInput(
    "bankName",
    validateMaxLengthText(
      normalizedBankName,
      INITIAL_REGISTRATION_FIELD_LIMITS.bankName,
    ),
  );
  assertValidInput("bankName", validateFullWidthText(normalizedBankName));

  if (!isValidBankNameByCode(normalizedBankCode, normalizedBankName)) {
    throw new BadRequestError("銀行名は候補から選択してください。");
  }

  assertValidInput(
    "accountType",
    validateMaxLengthText(
      normalizedAccountType,
      INITIAL_REGISTRATION_FIELD_LIMITS.accountType,
    ),
  );

  if (!isBankAccountType(normalizedAccountType)) {
    throw new BadRequestError("預金種目を確認してください。");
  }

  assertValidInput(
    "branchName",
    validateMaxLengthText(
      normalizedBranchName,
      INITIAL_REGISTRATION_FIELD_LIMITS.branchName,
    ),
  );
  assertValidInput("branchName", validateFullWidthText(normalizedBranchName));

  if (
    !isValidBranchNameByCode({
      bankCode: normalizedBankCode,
      branchCode: normalizedBranchCode,
      branchName: normalizedBranchName,
    })
  ) {
    throw new BadRequestError("店名は候補から選択してください。");
  }

  assertValidInput(
    "accountNumber",
    validateMaxLengthText(
      normalizedAccountNumber,
      INITIAL_REGISTRATION_FIELD_LIMITS.accountNumber,
    ),
  );
  assertValidInput(
    "accountNumber",
    validateHalfWidthNumericText(normalizedAccountNumber),
  );
  return {
    name: normalizedName,
    password: normalizedPassword,
    passwordConfirmation: normalizedPasswordConfirmation,
    address: normalizedAddress,
    phoneNumber: normalizedPhoneNumber,
    bankName: normalizedBankName,
    accountType: normalizedAccountType,
    branchName: normalizedBranchName,
    accountNumber: normalizedAccountNumber,
    accountHolder: normalizedAccountHolder,
  };
}
