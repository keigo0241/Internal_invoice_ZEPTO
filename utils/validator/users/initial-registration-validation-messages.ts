import type {
  InitialRegistrationFieldName,
  InitialRegistrationValidationErrorCode,
} from "@/utils/validator/users/initial-registration";

const initialRegistrationMessageLimits = {
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

const initialRegistrationFieldLabels: Record<
  InitialRegistrationFieldName,
  string
> = {
  name: "氏名",
  password: "パスワード",
  passwordConfirmation: "パスワード確認用",
  address: "住所",
  phoneNumber: "電話番号",
  bankName: "銀行名",
  bankCode: "銀行名",
  accountType: "預金種目",
  branchName: "店名",
  branchCode: "店名",
  accountNumber: "口座番号",
  accountHolder: "口座名義",
};

const initialRegistrationFieldMaxLengths: Partial<
  Record<InitialRegistrationFieldName, number>
> = {
  name: initialRegistrationMessageLimits.name,
  password: initialRegistrationMessageLimits.passwordMax,
  passwordConfirmation: initialRegistrationMessageLimits.passwordMax,
  address: initialRegistrationMessageLimits.address,
  phoneNumber: initialRegistrationMessageLimits.phoneNumber,
  bankName: initialRegistrationMessageLimits.bankName,
  accountType: initialRegistrationMessageLimits.accountType,
  branchName: initialRegistrationMessageLimits.branchName,
  accountNumber: initialRegistrationMessageLimits.accountNumber,
  accountHolder: initialRegistrationMessageLimits.accountHolder,
};

export function getInitialRegistrationValidationMessage(
  fieldName: InitialRegistrationFieldName,
  errorCode: InitialRegistrationValidationErrorCode,
) {
  const fieldLabel = initialRegistrationFieldLabels[fieldName];
  const maxLength = initialRegistrationFieldMaxLengths[fieldName];

  switch (errorCode) {
    case "required":
      return `${fieldLabel}を入力してください。`;
    case "tooShort":
      return `${fieldLabel}は${initialRegistrationMessageLimits.passwordMin}文字以上で入力してください。`;
    case "tooLong":
      return maxLength
        ? `${fieldLabel}は${maxLength}文字以内で入力してください。`
        : `${fieldLabel}を確認してください。`;
    case "invalidHalfWidthAlphanumeric":
      return `${fieldLabel}は半角英数字のみで入力してください。`;
    case "invalidHalfWidthNumeric":
      return `${fieldLabel}は半角数字のみで入力してください。`;
    case "invalidFullWidth":
      return `${fieldLabel}は全角で入力してください。`;
    case "invalidPhoneNumber":
    case "invalidBankCode":
    case "invalidBranchCode":
      return `${fieldLabel}を確認してください。`;
    case "passwordMismatch":
      return "パスワードと確認用パスワードが一致しません。";
  }
}
