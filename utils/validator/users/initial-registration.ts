import {
  validateBankCodeText,
  validateBranchCodeText,
} from "@/utils/validator/banks/bank-code";
import {
  validatePasswordConfirmationText,
  validatePasswordText,
} from "@/utils/validator/input/password";
import { validateOptionalPhoneText } from "@/utils/validator/input/phone";
import {
  INPUT_TEXT_PATTERNS,
  validateFullWidthText,
  validateHalfWidthNumericText,
  validateMaxLengthText,
  validateOptionalMaxLengthText,
  validateRequiredText,
} from "@/utils/validator/input/text";

export const INITIAL_REGISTRATION_FIELD_LIMITS = {
  name: 100,
  passwordMin: 8,
  passwordMax: 128,
  address: 255,
  phoneNumber: 20,
  bankName: 100,
  branchName: 100,
  accountType: 20,
  accountNumber: 20,
  accountHolder: 100,
} as const;

export const INITIAL_REGISTRATION_FIELD_PATTERNS = INPUT_TEXT_PATTERNS;

export type InitialRegistrationValidationValues = {
  name: string;
  password: string;
  passwordConfirmation: string;
  address: string;
  phoneNumber: string;
  bankName: string;
  bankCode: string;
  accountType: string;
  branchName: string;
  branchCode: string;
  accountNumber: string;
  accountHolder: string;
};

export type InitialRegistrationFieldName =
  keyof InitialRegistrationValidationValues;

export type InitialRegistrationFieldErrors = Partial<
  Record<InitialRegistrationFieldName, string>
>;

export const INITIAL_REGISTRATION_FIELD_NAMES = [
  "name",
  "password",
  "passwordConfirmation",
  "address",
  "phoneNumber",
  "bankName",
  "bankCode",
  "accountType",
  "branchName",
  "branchCode",
  "accountNumber",
  "accountHolder",
] as const satisfies InitialRegistrationFieldName[];

function validateBankNameValue(values: InitialRegistrationValidationValues) {
  return (
    validateRequiredText(values.bankName, "銀行名") ??
    validateMaxLengthText(
      values.bankName,
      INITIAL_REGISTRATION_FIELD_LIMITS.bankName,
      "銀行名",
    ) ??
    validateFullWidthText(values.bankName, "銀行名") ??
    validateRequiredText(values.bankCode, "銀行名") ??
    validateBankCodeText(values.bankCode)
  );
}

function validateBranchNameValue(values: InitialRegistrationValidationValues) {
  return (
    validateRequiredText(values.branchName, "店名") ??
    validateMaxLengthText(
      values.branchName,
      INITIAL_REGISTRATION_FIELD_LIMITS.branchName,
      "店名",
    ) ??
    validateFullWidthText(values.branchName, "店名") ??
    validateRequiredText(values.branchCode, "店名") ??
    validateBranchCodeText(values.branchCode)
  );
}

export function validateNameText(value: string) {
  return (
    validateRequiredText(value, "氏名") ??
    validateMaxLengthText(
      value,
      INITIAL_REGISTRATION_FIELD_LIMITS.name,
      "氏名",
    )
  );
}

export function validateOptionalAddressText(value: string) {
  return validateOptionalMaxLengthText(
    value,
    INITIAL_REGISTRATION_FIELD_LIMITS.address,
    "住所",
  );
}

export function validateAccountHolderText(value: string) {
  return (
    validateRequiredText(value, "口座名義") ??
    validateMaxLengthText(
      value,
      INITIAL_REGISTRATION_FIELD_LIMITS.accountHolder,
      "口座名義",
    ) ??
    validateFullWidthText(value, "口座名義")
  );
}

export function validateInitialRegistrationInputValue(
  fieldName: InitialRegistrationFieldName,
  values: InitialRegistrationValidationValues,
) {
  switch (fieldName) {
    case "name":
      return validateNameText(values.name);
    case "password":
      return validatePasswordText({
        value: values.password,
        minLength: INITIAL_REGISTRATION_FIELD_LIMITS.passwordMin,
        maxLength: INITIAL_REGISTRATION_FIELD_LIMITS.passwordMax,
      });
    case "passwordConfirmation":
      return validatePasswordConfirmationText(
        values.password,
        values.passwordConfirmation,
      );
    case "address":
      return validateOptionalAddressText(values.address);
    case "phoneNumber":
      return validateOptionalPhoneText(
        values.phoneNumber,
        INITIAL_REGISTRATION_FIELD_LIMITS.phoneNumber,
      );
    case "bankName":
    case "bankCode":
      return validateBankNameValue(values);
    case "branchName":
    case "branchCode":
      return validateBranchNameValue(values);
    case "accountType":
      return validateRequiredText(values.accountType, "預金種目");
    case "accountNumber":
      return (
        validateRequiredText(values.accountNumber, "口座番号") ??
        validateMaxLengthText(
          values.accountNumber,
          INITIAL_REGISTRATION_FIELD_LIMITS.accountNumber,
          "口座番号",
        ) ??
        validateHalfWidthNumericText(values.accountNumber, "口座番号")
      );
    case "accountHolder":
      return validateAccountHolderText(values.accountHolder);
  }
}

export function validateInitialRegistrationSubmitValues(
  values: InitialRegistrationValidationValues,
) {
  return INITIAL_REGISTRATION_FIELD_NAMES.reduce<InitialRegistrationFieldErrors>(
    (errors, fieldName) => {
      const errorMessage = validateInitialRegistrationInputValue(
        fieldName,
        values,
      );

      return errorMessage
        ? {
            ...errors,
            [fieldName]: errorMessage,
          }
        : errors;
    },
    {},
  );
}

export function getFirstInitialRegistrationError(
  errors: InitialRegistrationFieldErrors,
) {
  const firstErrorFieldName = INITIAL_REGISTRATION_FIELD_NAMES.find(
    (fieldName) => errors[fieldName],
  );

  return firstErrorFieldName ? errors[firstErrorFieldName] ?? null : null;
}

export function isInitialRegistrationFieldName(
  value: string,
): value is InitialRegistrationFieldName {
  return INITIAL_REGISTRATION_FIELD_NAMES.some((fieldName) => fieldName === value);
}
