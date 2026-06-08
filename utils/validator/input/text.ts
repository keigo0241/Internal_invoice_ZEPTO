export const INPUT_TEXT_PATTERNS = {
  halfWidthAlphanumeric: "^[A-Za-z0-9]+$",
  halfWidthNumeric: "^[0-9]+$",
  fullWidthText:
    "^[\\u3040-\\u309F\\u30A0-\\u30FF\\u3400-\\u9FFF\\uF900-\\uFAFF\\u3007Ａ-Ｚａ-ｚ０-９　]+$",
} as const;

const halfWidthAlphanumericRegex = new RegExp(
  INPUT_TEXT_PATTERNS.halfWidthAlphanumeric,
);
const halfWidthNumericRegex = new RegExp(INPUT_TEXT_PATTERNS.halfWidthNumeric);
const fullWidthTextRegex = new RegExp(INPUT_TEXT_PATTERNS.fullWidthText, "u");

export type TextValidationErrorCode =
  | "required"
  | "tooLong"
  | "invalidHalfWidthAlphanumeric"
  | "invalidHalfWidthNumeric"
  | "invalidFullWidth";

export function isHalfWidthAlphanumeric(value: string) {
  return halfWidthAlphanumericRegex.test(value);
}

export function isHalfWidthNumeric(value: string) {
  return halfWidthNumericRegex.test(value);
}

export function isFullWidthText(value: string) {
  return fullWidthTextRegex.test(value);
}

export function validateRequiredText(value: string): TextValidationErrorCode | null {
  if (!value.trim()) {
    return "required";
  }

  return null;
}

export function validateMaxLengthText(
  value: string,
  maxLength: number,
): TextValidationErrorCode | null {
  if (value.trim().length > maxLength) {
    return "tooLong";
  }

  return null;
}

export function validateOptionalMaxLengthText(
  value: string,
  maxLength: number,
): TextValidationErrorCode | null {
  if (!value.trim()) {
    return null;
  }

  return validateMaxLengthText(value, maxLength);
}

export function validateHalfWidthAlphanumericText(value: string) {
  if (!isHalfWidthAlphanumeric(value.trim())) {
    return "invalidHalfWidthAlphanumeric";
  }

  return null;
}

export function validateHalfWidthNumericText(value: string) {
  if (!isHalfWidthNumeric(value.trim())) {
    return "invalidHalfWidthNumeric";
  }

  return null;
}

export function validateFullWidthText(value: string) {
  if (!isFullWidthText(value.trim())) {
    return "invalidFullWidth";
  }

  return null;
}
