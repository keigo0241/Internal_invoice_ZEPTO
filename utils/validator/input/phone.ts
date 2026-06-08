import isMobilePhone from "validator/lib/isMobilePhone";
import isNumeric from "validator/lib/isNumeric";
import { validateMaxLengthText } from "@/utils/validator/input/text";

export type PhoneValidationErrorCode = "tooLong" | "invalidPhoneNumber";

export function validateOptionalPhoneText(
  value: string,
  maxLength: number,
): PhoneValidationErrorCode | null {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const maxLengthError = validateMaxLengthText(normalizedValue, maxLength);

  if (maxLengthError) {
    return "tooLong";
  }

  if (
    !isNumeric(normalizedValue) &&
    !isMobilePhone(normalizedValue, "ja-JP")
  ) {
    return "invalidPhoneNumber";
  }

  return null;
}
