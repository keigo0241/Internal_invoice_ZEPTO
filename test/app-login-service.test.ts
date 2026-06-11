import { beforeEach, describe, expect, it, vi } from "vitest";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { existsUserByEmail } from "@/features/auth/repositories/exists-user-by-email";
import { loginAppUser } from "@/features/auth/services/app-login";
import { authenticateCognitoUser } from "@/features/auth/services/cognito-auth";
import { ForbiddenError, NotFoundError } from "@/lib/api/errors";

vi.mock("@/features/auth/repositories/exists-user-by-email", () => ({
  existsUserByEmail: vi.fn(),
}));

vi.mock("@/features/auth/services/cognito-auth", () => ({
  authenticateCognitoUser: vi.fn(),
}));

const mockedExistsUserByEmail = vi.mocked(existsUserByEmail);
const mockedAuthenticateCognitoUser = vi.mocked(authenticateCognitoUser);

const form = {
  email: "keigo@zpt-ai.com",
  password: "password123",
};

const tokens = {
  idToken: "id-token",
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

describe("loginAppUser", () => {
  beforeEach(() => {
    mockedExistsUserByEmail.mockReset();
    mockedAuthenticateCognitoUser.mockReset();
  });

  it("authenticates registered user and returns dashboard path", async () => {
    mockedExistsUserByEmail.mockResolvedValue(true);
    mockedAuthenticateCognitoUser.mockResolvedValue(tokens);

    await expect(
      loginAppUser({
        googleVerifiedEmail: "KEIGO@ZPT-AI.COM",
        form,
      }),
    ).resolves.toEqual({
      redirectPath: GOOGLE_AUTH_CONFIG.successPath,
      tokens,
    });
    expect(mockedExistsUserByEmail).toHaveBeenCalledWith("keigo@zpt-ai.com");
    expect(mockedAuthenticateCognitoUser).toHaveBeenCalledWith({
      email: "keigo@zpt-ai.com",
      password: "password123",
    });
  });

  it("throws when Google verified email and login email do not match", async () => {
    await expect(
      loginAppUser({
        googleVerifiedEmail: "other@zpt-ai.com",
        form,
      }),
    ).rejects.toThrow(ForbiddenError);
    expect(mockedExistsUserByEmail).not.toHaveBeenCalled();
  });

  it("throws when user is not registered", async () => {
    mockedExistsUserByEmail.mockResolvedValue(false);

    await expect(
      loginAppUser({
        googleVerifiedEmail: "keigo@zpt-ai.com",
        form,
      }),
    ).rejects.toThrow(NotFoundError);
    expect(mockedAuthenticateCognitoUser).not.toHaveBeenCalled();
  });
});
