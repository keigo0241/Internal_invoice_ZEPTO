export type InitialRegistrationForm = {
  name: string;
  password: string;
  passwordConfirmation: string;
  bankName: string;
  accountType: string;
  branchName: string;
  accountNumber: string;
  accountHolder: string;
};

export type CreateInitialRegistrationUserParams = {
  name: string;
  email: string;
  passwordHash: string;
  bankName: string;
  accountType: string;
  branchName: string;
  accountNumber: string;
  accountHolder: string;
};
