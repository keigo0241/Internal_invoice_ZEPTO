import { beforeEach, describe, expect, it, vi } from "vitest";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { getGoogleAuthNextStep } from "@/features/auth/services/google-auth-flow";
import { existsUserByEmail } from "@/features/auth/repositories/exists-user-by-email";

vi.mock("@/features/auth/repositories/exists-user-by-email", () => ({
  existsUserByEmail: vi.fn(),
}));

const mockedExistsUserByEmail = vi.mocked(existsUserByEmail);

describe("getGoogleAuthNextStep", () => {
  beforeEach(() => {
    mockedExistsUserByEmail.mockReset();
  });

  it("returns app login path when the Google email is already registered", async () => {
    mockedExistsUserByEmail.mockResolvedValue(true);

    await expect(getGoogleAuthNextStep("keigo@zpt-ai.com")).resolves.toEqual({
      isRegistered: true,
      nextPath: GOOGLE_AUTH_CONFIG.appLoginPath,
    });
  });

  it("returns initial registration path when the Google email is not registered", async () => {
    mockedExistsUserByEmail.mockResolvedValue(false);

    await expect(getGoogleAuthNextStep("keigo@zpt-ai.com")).resolves.toEqual({
      isRegistered: false,
      nextPath: GOOGLE_AUTH_CONFIG.initialRegistrationPath,
    });
  });
});
