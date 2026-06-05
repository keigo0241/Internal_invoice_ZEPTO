import isMobilePhone from "validator/lib/isMobilePhone";
import isNumeric from "validator/lib/isNumeric";
import { validateMaxLengthText } from "@/utils/validator/input/text";

export function validateOptionalPhoneText(
  value: string,
  maxLength: number,
) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const maxLengthError = validateMaxLengthText(
    normalizedValue,
    maxLength,
    "電話番号",
  );

  if (maxLengthError) {
    return maxLengthError;
  }

  if (
    !isNumeric(normalizedValue) &&
    !isMobilePhone(normalizedValue, "ja-JP")
  ) {
    return "電話番号を確認してください。";
  }

  return null;
}
