import isMobilePhone from "validator/lib/isMobilePhone";
import isNumeric from "validator/lib/isNumeric";
import { validateMaxLengthText } from "@/utils/validator/input/text";

export function validateOptionalPhoneText(
  value: string,
  maxLength: number,
  fieldName: string,
) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const maxLengthError = validateMaxLengthText(
    normalizedValue,
    maxLength,
    fieldName,
  );

  if (maxLengthError) {
    return maxLengthError;
  }

  if (
    !isNumeric(normalizedValue) &&
    !isMobilePhone(normalizedValue, "ja-JP")
  ) {
    return `${fieldName}を確認してください。`;
  }

  return null;
}
