import isEmail from "validator/lib/isEmail";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isEmailLike(value: string) {
  return isEmail(normalizeEmail(value));
}

export function validateEmailText(value: string, fieldName: string) {
  if (!isEmailLike(value)) {
    return `${fieldName}を確認してください。`;
  }

  return null;
}
