import {
  validateHalfWidthAlphanumericText,
  validateMaxLengthText,
  validateRequiredText,
} from "@/utils/validator/input/text";

export type PasswordValidationErrorCode =
  | "required"
  | "tooShort"
  | "tooLong"
  | "invalidHalfWidthAlphanumeric"
  | "passwordMismatch";

type ValidatePasswordTextParams = {
  value: string;
  minLength: number;
  maxLength: number;
};

export function validatePasswordText({
  value,
  minLength,
  maxLength,
}: ValidatePasswordTextParams): PasswordValidationErrorCode | null {
  const requiredError = validateRequiredText(value);

  if (requiredError) {
    return "required";
  }

  if (value.trim().length < minLength) {
    return "tooShort";
  }

  if (validateMaxLengthText(value, maxLength)) {
    return "tooLong";
  }

  if (validateHalfWidthAlphanumericText(value)) {
    return "invalidHalfWidthAlphanumeric";
  }

  return null;
}

export function validatePasswordConfirmationText(
  password: string,
  passwordConfirmation: string,
): PasswordValidationErrorCode | null {
  const requiredError = validateRequiredText(passwordConfirmation);

  if (requiredError) {
    return "required";
  }

  if (password !== passwordConfirmation) {
    return "passwordMismatch";
  }

  return null;
}
