import { beforeEach, describe, expect, it, vi } from "vitest";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import {
  createInitialRegistrationUser,
  existsUserByEmail,
} from "@/features/auth/repositories/user-repository";
import { registerInitialUser } from "@/features/auth/services/initial-registration";
import { hashPassword } from "@/features/auth/services/password";
import { ConflictError } from "@/lib/api/errors";

vi.mock("@/features/auth/repositories/user-repository", () => ({
  createInitialRegistrationUser: vi.fn(),
  existsUserByEmail: vi.fn(),
}));

vi.mock("@/features/auth/services/password", () => ({
  hashPassword: vi.fn(),
}));

const mockedCreateInitialRegistrationUser = vi.mocked(
  createInitialRegistrationUser,
);
const mockedExistsUserByEmail = vi.mocked(existsUserByEmail);
const mockedHashPassword = vi.mocked(hashPassword);

const form = {
  name: "辻井啓悟",
  password: "password123",
  passwordConfirmation: "password123",
  bankName: "〇〇銀行",
  accountType: "ordinary",
  branchName: "〇〇支店",
  accountNumber: "1234567",
  accountHolder: "ツジイ　ケイゴ",
};

describe("registerInitialUser", () => {
  beforeEach(() => {
    mockedCreateInitialRegistrationUser.mockReset();
    mockedExistsUserByEmail.mockReset();
    mockedHashPassword.mockReset();
  });

  it("creates the user and returns app login path when email is not registered", async () => {
    mockedExistsUserByEmail.mockResolvedValue(false);
    mockedCreateInitialRegistrationUser.mockResolvedValue({ id: "1" });
    mockedHashPassword.mockResolvedValue("hashed-password");

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
      passwordHash: "hashed-password",
      bankName: form.bankName,
      accountType: form.accountType,
      branchName: form.branchName,
      accountNumber: form.accountNumber,
      accountHolder: form.accountHolder,
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
  });
});
