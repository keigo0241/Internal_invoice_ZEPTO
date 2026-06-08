"use client";

import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { jp } from "@/assets/translations/jp";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import {
  type BankBranchOption,
  type BankOption,
} from "@/features/banks/types/bank";
import {
  getFirstInitialRegistrationError,
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

type UseInitialRegistrationContentParams = {
  googleVerifiedEmail: string;
};

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

const bankNameListId = "initial-registration-bank-name-options";
const branchNameListId = "initial-registration-branch-name-options";

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
  const normalizedBankName = bankName.trim();

  return bankOptions.find((bank) => bank.name === normalizedBankName);
}

function findSelectedBranch(
  branchOptions: BankBranchOption[],
  branchName: string,
) {
  const normalizedBranchName = branchName.trim();

  return branchOptions.find((branch) => branch.name === normalizedBranchName);
}

export function useInitialRegistrationContent({
  googleVerifiedEmail,
}: UseInitialRegistrationContentParams) {
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
    const normalizedBankName = bankName.trim();

    if (!normalizedBankName) {
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
    const normalizedNextBankName = nextBankName.trim();

    setBankName(nextBankName);
    setBranchName("");
    setBranchOptions([]);
    setSelectedBranchCode("");

    if (!normalizedNextBankName) {
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
    const validationError = getFirstInitialRegistrationError(nextFieldErrors);

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

  return {
    accountNumber,
    bankName,
    bankNameListId,
    bankOptions,
    branchName,
    branchNameListId,
    branchOptions,
    errorMessage,
    fieldErrors,
    googleVerifiedEmail,
    handleAccountNumberChange,
    handleBankNameChange,
    handleBranchNameChange,
    handleFormChange,
    handlePasswordChange,
    handlePasswordConfirmationChange,
    handlePhoneNumberChange,
    handleSubmit,
    isSubmitting,
    password,
    passwordConfirmation,
    phoneNumber,
    selectedBankCode,
    selectedBranchCode,
  };
}
