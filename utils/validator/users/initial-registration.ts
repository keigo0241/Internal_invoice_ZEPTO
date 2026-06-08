import {
  validateBankCodeText,
  validateBranchCodeText,
  type BankCodeValidationErrorCode,
} from "@/utils/validator/banks/bank-code";
import {
  validatePasswordConfirmationText,
  validatePasswordText,
  type PasswordValidationErrorCode,
} from "@/utils/validator/input/password";
import {
  validateOptionalPhoneText,
  type PhoneValidationErrorCode,
} from "@/utils/validator/input/phone";
import {
  INPUT_TEXT_PATTERNS,
  type TextValidationErrorCode,
  validateFullWidthText,
  validateHalfWidthNumericText,
  validateMaxLengthText,
  validateOptionalMaxLengthText,
  validateRequiredText,
} from "@/utils/validator/input/text";
import { getInitialRegistrationValidationMessage } from "@/utils/validator/users/initial-registration-validation-messages";

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

export type InitialRegistrationValidationErrorCode =
  | TextValidationErrorCode
  | PasswordValidationErrorCode
  | PhoneValidationErrorCode
  | BankCodeValidationErrorCode;

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
    validateRequiredText(values.bankName) ??
    validateMaxLengthText(
      values.bankName,
      INITIAL_REGISTRATION_FIELD_LIMITS.bankName,
    ) ??
    validateFullWidthText(values.bankName) ??
    validateRequiredText(values.bankCode) ??
    validateBankCodeText(values.bankCode)
  );
}

function validateBranchNameValue(values: InitialRegistrationValidationValues) {
  return (
    validateRequiredText(values.branchName) ??
    validateMaxLengthText(
      values.branchName,
      INITIAL_REGISTRATION_FIELD_LIMITS.branchName,
    ) ??
    validateFullWidthText(values.branchName) ??
    validateRequiredText(values.branchCode) ??
    validateBranchCodeText(values.branchCode)
  );
}

export function validateNameText(value: string) {
  return (
    validateRequiredText(value) ??
    validateMaxLengthText(value, INITIAL_REGISTRATION_FIELD_LIMITS.name)
  );
}

export function validateOptionalAddressText(value: string) {
  return validateOptionalMaxLengthText(
    value,
    INITIAL_REGISTRATION_FIELD_LIMITS.address,
  );
}

export function validateAccountHolderText(value: string) {
  return (
    validateRequiredText(value) ??
    validateMaxLengthText(
      value,
      INITIAL_REGISTRATION_FIELD_LIMITS.accountHolder,
    ) ??
    validateFullWidthText(value)
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
      return validateRequiredText(values.accountType);
    case "accountNumber":
      return (
        validateRequiredText(values.accountNumber) ??
        validateMaxLengthText(
          values.accountNumber,
          INITIAL_REGISTRATION_FIELD_LIMITS.accountNumber,
        ) ??
        validateHalfWidthNumericText(values.accountNumber)
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
      const errorCode = validateInitialRegistrationInputValue(
        fieldName,
        values,
      );

      return errorCode
        ? {
            ...errors,
            [fieldName]: getInitialRegistrationValidationMessage(
              fieldName,
              errorCode,
            ),
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
