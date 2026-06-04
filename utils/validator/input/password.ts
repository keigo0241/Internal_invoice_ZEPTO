import {
  validateHalfWidthAlphanumericText,
  validateMaxLengthText,
  validateRequiredText,
} from "@/utils/validator/input/text";

type ValidatePasswordTextParams = {
  value: string;
  fieldName: string;
  minLength: number;
  maxLength: number;
};

export function validatePasswordText({
  value,
  fieldName,
  minLength,
  maxLength,
}: ValidatePasswordTextParams) {
  const requiredError = validateRequiredText(value, fieldName);

  if (requiredError) {
    return requiredError;
  }

  if (value.trim().length < minLength) {
    return `${fieldName}は${minLength}文字以上で入力してください。`;
  }

  return (
    validateMaxLengthText(value, maxLength, fieldName) ??
    validateHalfWidthAlphanumericText(value, fieldName)
  );
}

export function validatePasswordConfirmationText(
  password: string,
  passwordConfirmation: string,
  fieldName: string,
) {
  const requiredError = validateRequiredText(passwordConfirmation, fieldName);

  if (requiredError) {
    return requiredError;
  }

  if (password !== passwordConfirmation) {
    return "パスワードと確認用パスワードが一致しません。";
  }

  return null;
}
