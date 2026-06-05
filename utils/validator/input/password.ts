import {
  validateHalfWidthAlphanumericText,
  validateMaxLengthText,
  validateRequiredText,
} from "@/utils/validator/input/text";

type ValidatePasswordTextParams = {
  value: string;
  minLength: number;
  maxLength: number;
};

export function validatePasswordText({
  value,
  minLength,
  maxLength,
}: ValidatePasswordTextParams) {
  const requiredError = validateRequiredText(value, "パスワード");

  if (requiredError) {
    return requiredError;
  }

  if (value.trim().length < minLength) {
    return `パスワードは${minLength}文字以上で入力してください。`;
  }

  return (
    validateMaxLengthText(value, maxLength, "パスワード") ??
    validateHalfWidthAlphanumericText(value, "パスワード")
  );
}

export function validatePasswordConfirmationText(
  password: string,
  passwordConfirmation: string,
) {
  const requiredError = validateRequiredText(
    passwordConfirmation,
    "パスワード確認用",
  );

  if (requiredError) {
    return requiredError;
  }

  if (password !== passwordConfirmation) {
    return "パスワードと確認用パスワードが一致しません。";
  }

  return null;
}
