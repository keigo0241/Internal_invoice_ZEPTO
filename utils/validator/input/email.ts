import isEmail from "validator/lib/isEmail";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isEmailLike(value: string) {
  return isEmail(normalizeEmail(value));
}

export type EmailValidationErrorCode = "invalidEmail";

export function validateEmailText(value: string): EmailValidationErrorCode | null {
  if (!isEmailLike(value)) {
    return "invalidEmail";
  }

  return null;
}
