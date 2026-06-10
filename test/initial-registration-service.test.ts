import { beforeEach, describe, expect, it, vi } from "vitest";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { createInitialRegistrationUser } from "@/features/auth/repositories/create-initial-registration-user";
import { existsUserByEmail } from "@/features/auth/repositories/exists-user-by-email";
import {
  deleteCognitoUser,
  registerCognitoUser,
} from "@/features/auth/services/cognito-user";
import { registerInitialUser } from "@/features/auth/services/initial-registration";
import { BankAccountType } from "@/features/users/types/bank-account";
import { ConflictError } from "@/lib/api/errors";

vi.mock("@/features/auth/repositories/create-initial-registration-user", () => ({
  createInitialRegistrationUser: vi.fn(),
}));

vi.mock("@/features/auth/repositories/exists-user-by-email", () => ({
  existsUserByEmail: vi.fn(),
}));

vi.mock("@/features/auth/services/cognito-user", () => ({
  deleteCognitoUser: vi.fn(),
  registerCognitoUser: vi.fn(),
}));

const mockedCreateInitialRegistrationUser = vi.mocked(
  createInitialRegistrationUser,
);
const mockedExistsUserByEmail = vi.mocked(existsUserByEmail);
const mockedDeleteCognitoUser = vi.mocked(deleteCognitoUser);
const mockedRegisterCognitoUser = vi.mocked(registerCognitoUser);

const form = {
  name: "辻井啓悟",
  password: "password123",
  passwordConfirmation: "password123",
  address: null,
  phoneNumber: null,
  bankName: "信金中央金庫",
  accountType: BankAccountType.Ordinary,
  branchName: "北海道",
  accountNumber: "1234567",
  accountHolder: "ツジイ　ケイゴ",
};

describe("registerInitialUser", () => {
  beforeEach(() => {
    mockedCreateInitialRegistrationUser.mockReset();
    mockedExistsUserByEmail.mockReset();
    mockedDeleteCognitoUser.mockReset();
    mockedRegisterCognitoUser.mockReset();
  });

  it("creates the user and returns app login path when email is not registered", async () => {
    mockedExistsUserByEmail.mockResolvedValue(false);
    mockedRegisterCognitoUser.mockResolvedValue(undefined);
    mockedCreateInitialRegistrationUser.mockResolvedValue({ id: "1" });

    await expect(
      registerInitialUser({
        googleVerifiedEmail: "keigo@zpt-ai.com",
        form,
      }),
    ).resolves.toEqual({
      redirectPath: GOOGLE_AUTH_CONFIG.appLoginPath,
    });

    expect(mockedCreateInitialRegistrationUser).toHaveBeenCalledWith({
      name: form.name,
      email: "keigo@zpt-ai.com",
      address: form.address,
      phoneNumber: form.phoneNumber,
      bankName: form.bankName,
      accountType: form.accountType,
      branchName: form.branchName,
      accountNumber: form.accountNumber,
      accountHolder: form.accountHolder,
    });
    expect(mockedRegisterCognitoUser).toHaveBeenCalledWith({
      email: "keigo@zpt-ai.com",
      password: form.password,
    });
  });

  it("throws when the email is already registered", async () => {
    mockedExistsUserByEmail.mockResolvedValue(true);

    await expect(
      registerInitialUser({
        googleVerifiedEmail: "keigo@zpt-ai.com",
        form,
      }),
    ).rejects.toThrow(ConflictError);
    expect(mockedRegisterCognitoUser).not.toHaveBeenCalled();
  });

  it("deletes the Cognito user when database user creation fails", async () => {
    const error = new Error("db failed");

    mockedExistsUserByEmail.mockResolvedValue(false);
    mockedRegisterCognitoUser.mockResolvedValue(undefined);
    mockedCreateInitialRegistrationUser.mockRejectedValue(error);
    mockedDeleteCognitoUser.mockResolvedValue(undefined);

    await expect(
      registerInitialUser({
        googleVerifiedEmail: "keigo@zpt-ai.com",
        form,
      }),
    ).rejects.toThrow(error);
    expect(mockedDeleteCognitoUser).toHaveBeenCalledWith("keigo@zpt-ai.com");
  });
});
