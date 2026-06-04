import { validateMaxLengthText } from "@/utils/validator/input/text";

export function validateOptionalPhoneText(
  value: string,
  maxLength: number,
  fieldName: string,
) {
  if (!value.trim()) {
    return null;
  }

  return validateMaxLengthText(value, maxLength, fieldName);
}
