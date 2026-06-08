import { type BankAccountType } from "@/features/users/types/bank-account";

export type InitialRegistrationForm = {
  name: string;
  password: string;
  passwordConfirmation: string;
  address: string | null;
  phoneNumber: string | null;
  bankName: string;
  accountType: BankAccountType;
  branchName: string;
  accountNumber: string;
  accountHolder: string;
};

export type CreateInitialRegistrationUserParams = {
  name: string;
  email: string;
  address: string | null;
  phoneNumber: string | null;
  bankName: string;
  accountType: BankAccountType;
  branchName: string;
  accountNumber: string;
  accountHolder: string;
};
