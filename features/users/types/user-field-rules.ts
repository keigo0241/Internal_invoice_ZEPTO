export const USER_FIELD_LIMITS = {
  name: 100,
  passwordMin: 8,
  passwordMax: 128,
  bankName: 100,
  branchName: 100,
  accountType: 20,
  accountNumber: 20,
  accountHolder: 100,
} as const;

export const USER_FIELD_PATTERNS = {
  halfWidthAlphanumeric: "^[A-Za-z0-9]+$",
  halfWidthNumeric: "^[0-9]+$",
  fullWidthText:
    "^[\\u3040-\\u309F\\u30A0-\\u30FF\\u3400-\\u9FFF\\uF900-\\uFAFF\\u3007Ａ-Ｚａ-ｚ０-９　]+$",
} as const;

const halfWidthAlphanumericRegex = new RegExp(
  USER_FIELD_PATTERNS.halfWidthAlphanumeric,
);
const halfWidthNumericRegex = new RegExp(USER_FIELD_PATTERNS.halfWidthNumeric);
const fullWidthTextRegex = new RegExp(USER_FIELD_PATTERNS.fullWidthText, "u");

export function isHalfWidthAlphanumeric(value: string) {
  return halfWidthAlphanumericRegex.test(value);
}

export function isHalfWidthNumeric(value: string) {
  return halfWidthNumericRegex.test(value);
}

export function isFullWidthText(value: string) {
  return fullWidthTextRegex.test(value);
}
