import { beforeEach, describe, expect, it, vi } from "vitest";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { getGoogleAuthNextPath } from "@/features/auth/services/google-auth-flow";
import { existsUserByEmail } from "@/features/auth/repositories/exists-user-by-email";

vi.mock("@/features/auth/repositories/exists-user-by-email", () => ({
  existsUserByEmail: vi.fn(),
}));

const mockedExistsUserByEmail = vi.mocked(existsUserByEmail);

describe("getGoogleAuthNextPath", () => {
  beforeEach(() => {
    mockedExistsUserByEmail.mockReset();
  });

  it("returns app login path when the Google email is already registered", async () => {
    mockedExistsUserByEmail.mockResolvedValue(true);

    await expect(getGoogleAuthNextPath("keigo@zpt-ai.com")).resolves.toBe(
      GOOGLE_AUTH_CONFIG.appLoginPath,
    );
  });

  it("returns initial registration path when the Google email is not registered", async () => {
    mockedExistsUserByEmail.mockResolvedValue(false);

    await expect(getGoogleAuthNextPath("keigo@zpt-ai.com")).resolves.toBe(
      GOOGLE_AUTH_CONFIG.initialRegistrationPath,
    );
  });
});
