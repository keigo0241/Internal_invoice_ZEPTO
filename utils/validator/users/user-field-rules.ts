import { INPUT_TEXT_PATTERNS } from "@/utils/validator/input/text";

export const USER_FIELD_LIMITS = {
  name: 100,
  passwordMin: 8,
  passwordMax: 128,
  address: 255,
  phoneNumber: 20,
  bankName: 100,
  branchName: 100,
  accountType: 20,
  accountNumber: 20,
  accountHolder: 100,
} as const;

export const USER_FIELD_PATTERNS = INPUT_TEXT_PATTERNS;
