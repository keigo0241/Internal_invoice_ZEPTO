"use client";

import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { jp } from "@/assets/translations/jp";
import { Button } from "@/components/ui/button";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import {
  type BankBranchOption,
  type BankOption,
} from "@/features/banks/types/bank";
import {
  BANK_ACCOUNT_TYPE_VALUES,
  BankAccountType,
} from "@/features/users/types/bank-account";
import {
  getFirstInitialRegistrationError,
  INITIAL_REGISTRATION_FIELD_LIMITS,
  INITIAL_REGISTRATION_FIELD_PATTERNS,
  type InitialRegistrationFieldErrors,
  type InitialRegistrationFieldName,
  type InitialRegistrationValidationValues,
  isInitialRegistrationFieldName,
  validateInitialRegistrationSubmitValues,
} from "@/utils/validator/users/initial-registration";
import {
  filterHalfWidthAlphanumericInput,
  filterHalfWidthNumericInput,
} from "@/utils/validator/users/initial-registration-input-filter";
import { InputFieldRow } from "./_components/input-field-row";
import {
  type SelectFieldOption,
  SelectFieldRow,
} from "./_components/select-field-row";

type InitialRegistrationContentProps = {
  googleVerifiedEmail: string;
};

const editableInputClassName =
  "h-11 rounded-md border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:border-sky-700 focus-visible:ring-sky-100";

const readOnlyInputClassName =
  "h-11 rounded-md border-slate-300 bg-slate-100 px-3 text-sm font-semibold text-slate-800";

const bankAccountTypeLabelMap: Record<BankAccountType, string> = {
  [BankAccountType.Ordinary]: jp.initialRegistration.accountTypeOptions.ordinary,
  [BankAccountType.Checking]: jp.initialRegistration.accountTypeOptions.checking,
  [BankAccountType.Savings]: jp.initialRegistration.accountTypeOptions.savings,
};

const bankAccountTypeOptions: SelectFieldOption[] = BANK_ACCOUNT_TYPE_VALUES.map(
  (accountType) => ({
    value: accountType,
    label: bankAccountTypeLabelMap[accountType],
  }),
);

const bankNameListId = "initial-registration-bank-name-options";
const branchNameListId = "initial-registration-branch-name-options";

type InitialRegistrationResponse = {
  data?: {
    redirectPath?: string;
  };
  message?: string;
};

type SearchBanksResponse = {
  data?: BankOption[];
};

type SearchBankBranchesResponse = {
  data?: BankBranchOption[];
};

function getFormStringValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function getInitialRegistrationFormValues(
  formData: FormData,
): InitialRegistrationValidationValues {
  return {
    name: getFormStringValue(formData, "name"),
    password: getFormStringValue(formData, "password"),
    passwordConfirmation: getFormStringValue(formData, "passwordConfirmation"),
    address: getFormStringValue(formData, "address"),
    phoneNumber: getFormStringValue(formData, "phoneNumber"),
    bankName: getFormStringValue(formData, "bankName"),
    bankCode: getFormStringValue(formData, "bankCode"),
    accountType: getFormStringValue(formData, "accountType"),
    branchName: getFormStringValue(formData, "branchName"),
    branchCode: getFormStringValue(formData, "branchCode"),
    accountNumber: getFormStringValue(formData, "accountNumber"),
    accountHolder: getFormStringValue(formData, "accountHolder"),
  };
}

async function parseInitialRegistrationResponse(response: Response) {
  try {
    return (await response.json()) as InitialRegistrationResponse;
  } catch {
    return {};
  }
}

async function fetchBankOptions(keyword: string, signal: AbortSignal) {
  const searchParams = new URLSearchParams({ keyword });
  const response = await fetch(`/api/v1/banks?${searchParams.toString()}`, {
    signal,
  });

  if (!response.ok) {
    return [];
  }

  const result = (await response.json()) as SearchBanksResponse;

  return result.data ?? [];
}

async function fetchBranchOptions(
  bankCode: string,
  keyword: string,
  signal: AbortSignal,
) {
  const searchParams = new URLSearchParams({ keyword });
  const response = await fetch(
    `/api/v1/banks/${bankCode}/branches?${searchParams.toString()}`,
    { signal },
  );

  if (!response.ok) {
    return [];
  }

  const result = (await response.json()) as SearchBankBranchesResponse;

  return result.data ?? [];
}

function findSelectedBank(bankOptions: BankOption[], bankName: string) {
  return bankOptions.find((bank) => bank.name === bankName.trim());
}

function findSelectedBranch(
  branchOptions: BankBranchOption[],
  branchName: string,
) {
  return branchOptions.find((branch) => branch.name === branchName.trim());
}

export function InitialRegistrationContent({
  googleVerifiedEmail,
}: InitialRegistrationContentProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] =
    useState<InitialRegistrationFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankOptions, setBankOptions] = useState<BankOption[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchOptions, setBranchOptions] = useState<BankBranchOption[]>([]);
  const [selectedBranchCode, setSelectedBranchCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  function clearFieldErrors(fieldNames: InitialRegistrationFieldName[]) {
    setFieldErrors((currentErrors) =>
      fieldNames.reduce<InitialRegistrationFieldErrors>(
        (nextErrors, fieldName) => ({
          ...nextErrors,
          [fieldName]: undefined,
        }),
        currentErrors,
      ),
    );
  }

  useEffect(() => {
    const controller = new AbortController();

    if (!bankName.trim()) {
      return () => controller.abort();
    }

    fetchBankOptions(bankName, controller.signal)
      .then((options) => {
        const selectedBank = findSelectedBank(options, bankName);

        setBankOptions(options);
        setSelectedBankCode(selectedBank?.code ?? "");
      })
      .catch(() => {
        setBankOptions([]);
        setSelectedBankCode("");
      });

    return () => controller.abort();
  }, [bankName]);

  useEffect(() => {
    const controller = new AbortController();

    if (!selectedBankCode) {
      return () => controller.abort();
    }

    fetchBranchOptions(selectedBankCode, branchName, controller.signal)
      .then((options) => {
        const selectedBranch = findSelectedBranch(options, branchName);

        setBranchOptions(options);
        setSelectedBranchCode(selectedBranch?.code ?? "");
      })
      .catch(() => {
        setBranchOptions([]);
        setSelectedBranchCode("");
      });

    return () => controller.abort();
  }, [branchName, selectedBankCode]);

  function handleBankNameChange(event: ChangeEvent<HTMLInputElement>) {
    const nextBankName = event.target.value;

    setBankName(nextBankName);
    setBranchName("");
    setBranchOptions([]);
    setSelectedBranchCode("");

    if (!nextBankName.trim()) {
      setBankOptions([]);
      setSelectedBankCode("");
    }

    clearFieldErrors(["bankName", "bankCode", "branchName", "branchCode"]);
  }

  function handleBranchNameChange(event: ChangeEvent<HTMLInputElement>) {
    setBranchName(event.target.value);
    clearFieldErrors(["branchName", "branchCode"]);
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(filterHalfWidthAlphanumericInput(event.target.value));
    clearFieldErrors(["password", "passwordConfirmation"]);
  }

  function handlePasswordConfirmationChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setPasswordConfirmation(filterHalfWidthAlphanumericInput(event.target.value));
    clearFieldErrors(["passwordConfirmation"]);
  }

  function handlePhoneNumberChange(event: ChangeEvent<HTMLInputElement>) {
    setPhoneNumber(filterHalfWidthNumericInput(event.target.value));
    clearFieldErrors(["phoneNumber"]);
  }

  function handleAccountNumberChange(event: ChangeEvent<HTMLInputElement>) {
    setAccountNumber(filterHalfWidthNumericInput(event.target.value));
    clearFieldErrors(["accountNumber"]);
  }

  function handleFormChange(event: FormEvent<HTMLFormElement>) {
    const target = event.target;

    if (
      !(target instanceof HTMLInputElement || target instanceof HTMLSelectElement) ||
      !isInitialRegistrationFieldName(target.name) ||
      !fieldErrors[target.name]
    ) {
      return;
    }

    clearFieldErrors([target.name]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const formValues = getInitialRegistrationFormValues(formData);
    const nextFieldErrors = validateInitialRegistrationSubmitValues(formValues);
    const validationError =
      getFirstInitialRegistrationError(nextFieldErrors);

    if (validationError) {
      setFieldErrors(nextFieldErrors);
      setErrorMessage(validationError);
      setIsSubmitting(false);

      return;
    }

    try {
      const response = await fetch(GOOGLE_AUTH_CONFIG.initialRegistrationApiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });
      const result = await parseInitialRegistrationResponse(response);

      if (!response.ok) {
        setErrorMessage(result.message ?? jp.initialRegistration.registrationError);
        setIsSubmitting(false);

        return;
      }

      router.push(result.data?.redirectPath ?? GOOGLE_AUTH_CONFIG.appLoginPath);
    } catch {
      setErrorMessage(jp.initialRegistration.registrationError);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <section className="mx-auto w-full max-w-[760px] rounded-md border border-slate-200 bg-white px-8 py-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          {jp.initialRegistration.title}
        </h1>

        <form
          className="mt-8 space-y-8"
          onChange={handleFormChange}
          onSubmit={handleSubmit}
        >
          <section>
            <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-slate-900">
              {jp.initialRegistration.userSectionTitle}
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
              <InputFieldRow
                id="name"
                label={jp.initialRegistration.labels.name}
                name="name"
                autoComplete="name"
                maxLength={INITIAL_REGISTRATION_FIELD_LIMITS.name}
                placeholder={jp.initialRegistration.placeholders.name}
                required
                errorMessage={fieldErrors.name}
                className={editableInputClassName}
              />

              <InputFieldRow
                id="email"
                label={jp.initialRegistration.labels.email}
                name="email"
                type="email"
                value={googleVerifiedEmail}
                autoComplete="email"
                readOnly
                className={readOnlyInputClassName}
              />

              <InputFieldRow
                id="password"
                label={jp.initialRegistration.labels.password}
                name="password"
                autoComplete="new-password"
                maxLength={INITIAL_REGISTRATION_FIELD_LIMITS.passwordMax}
                minLength={INITIAL_REGISTRATION_FIELD_LIMITS.passwordMin}
                pattern={INITIAL_REGISTRATION_FIELD_PATTERNS.halfWidthAlphanumeric}
                type="password"
                placeholder={jp.initialRegistration.placeholders.password}
                required
                value={password}
                onChange={handlePasswordChange}
                errorMessage={fieldErrors.password}
                className={editableInputClassName}
              />

              <InputFieldRow
                id="passwordConfirmation"
                label={jp.initialRegistration.labels.passwordConfirmation}
                name="passwordConfirmation"
                autoComplete="new-password"
                maxLength={INITIAL_REGISTRATION_FIELD_LIMITS.passwordMax}
                minLength={INITIAL_REGISTRATION_FIELD_LIMITS.passwordMin}
                pattern={INITIAL_REGISTRATION_FIELD_PATTERNS.halfWidthAlphanumeric}
                type="password"
                placeholder={
                  jp.initialRegistration.placeholders.passwordConfirmation
                }
                required
                value={passwordConfirmation}
                onChange={handlePasswordConfirmationChange}
                errorMessage={fieldErrors.passwordConfirmation}
                className={editableInputClassName}
              />

              <InputFieldRow
                id="address"
                label={jp.initialRegistration.labels.address}
                isRequired={false}
                name="address"
                type="text"
                autoComplete="street-address"
                maxLength={INITIAL_REGISTRATION_FIELD_LIMITS.address}
                placeholder={jp.initialRegistration.placeholders.address}
                errorMessage={fieldErrors.address}
                className={editableInputClassName}
              />

              <InputFieldRow
                id="phoneNumber"
                label={jp.initialRegistration.labels.phoneNumber}
                isRequired={false}
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                maxLength={INITIAL_REGISTRATION_FIELD_LIMITS.phoneNumber}
                placeholder={jp.initialRegistration.placeholders.phoneNumber}
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                errorMessage={fieldErrors.phoneNumber}
                className={editableInputClassName}
              />
            </div>
          </section>

          <section>
            <h2 className="border-b border-slate-200 pb-3 text-xl font-bold text-slate-900">
              {jp.initialRegistration.bankSectionTitle}
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
              <InputFieldRow
                id="bankName"
                label={jp.initialRegistration.labels.bankName}
                name="bankName"
                autoComplete="off"
                list={bankNameListId}
                maxLength={INITIAL_REGISTRATION_FIELD_LIMITS.bankName}
                pattern={INITIAL_REGISTRATION_FIELD_PATTERNS.fullWidthText}
                placeholder={jp.initialRegistration.placeholders.bankName}
                required
                value={bankName}
                onChange={handleBankNameChange}
                errorMessage={fieldErrors.bankName ?? fieldErrors.bankCode}
                className={editableInputClassName}
              />
              <input type="hidden" name="bankCode" value={selectedBankCode} />

              <SelectFieldRow
                id="accountType"
                label={jp.initialRegistration.labels.accountType}
                name="accountType"
                required
                className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
                defaultValue={BankAccountType.Ordinary}
                options={bankAccountTypeOptions}
              />

              <InputFieldRow
                id="branchName"
                label={jp.initialRegistration.labels.branchName}
                name="branchName"
                autoComplete="off"
                list={branchNameListId}
                maxLength={INITIAL_REGISTRATION_FIELD_LIMITS.branchName}
                pattern={INITIAL_REGISTRATION_FIELD_PATTERNS.fullWidthText}
                placeholder={jp.initialRegistration.placeholders.branchName}
                required
                value={branchName}
                onChange={handleBranchNameChange}
                errorMessage={fieldErrors.branchName ?? fieldErrors.branchCode}
                className={editableInputClassName}
              />
              <input type="hidden" name="branchCode" value={selectedBranchCode} />

              <InputFieldRow
                id="accountNumber"
                label={jp.initialRegistration.labels.accountNumber}
                name="accountNumber"
                autoComplete="off"
                inputMode="numeric"
                maxLength={INITIAL_REGISTRATION_FIELD_LIMITS.accountNumber}
                pattern={INITIAL_REGISTRATION_FIELD_PATTERNS.halfWidthNumeric}
                placeholder={jp.initialRegistration.placeholders.accountNumber}
                required
                value={accountNumber}
                onChange={handleAccountNumberChange}
                errorMessage={fieldErrors.accountNumber}
                className={editableInputClassName}
              />

              <InputFieldRow
                id="accountHolder"
                label={jp.initialRegistration.labels.accountHolder}
                name="accountHolder"
                autoComplete="off"
                maxLength={INITIAL_REGISTRATION_FIELD_LIMITS.accountHolder}
                pattern={INITIAL_REGISTRATION_FIELD_PATTERNS.fullWidthText}
                placeholder={jp.initialRegistration.placeholders.accountHolder}
                required
                errorMessage={fieldErrors.accountHolder}
                className={editableInputClassName}
              />
            </div>
          </section>

          <datalist id={bankNameListId}>
            {bankOptions.map((bank) => (
              <option
                key={bank.code}
                value={bank.name}
                label={`${bank.code} ${bank.kana}`}
              />
            ))}
          </datalist>

          <datalist id={branchNameListId}>
            {branchOptions.map((branch) => (
              <option
                key={branch.code}
                value={branch.name}
                label={`${branch.code} ${branch.kana}`}
              />
            ))}
          </datalist>

          {errorMessage ? (
            <p className="text-center text-sm font-semibold text-red-600">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 min-w-[220px] rounded-md bg-sky-800 px-6 text-base font-bold text-white hover:bg-sky-700"
            >
              {isSubmitting
                ? jp.initialRegistration.submittingButton
                : jp.initialRegistration.submitButton}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
