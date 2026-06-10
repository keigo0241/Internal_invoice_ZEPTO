import { beforeEach, describe, expect, it, vi } from "vitest";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { registerInitialUser } from "@/features/auth/services/initial-registration";
import { getGoogleAuthSessionFromRequest } from "@/features/auth/services/session";
import { BankAccountType } from "@/features/users/types/bank-account";
import { ConflictError } from "@/lib/api/errors";
import { POST } from "@/app/api/v1/auth/initial-registration/route";

vi.mock("@/features/auth/services/initial-registration", () => ({
  registerInitialUser: vi.fn(),
}));

vi.mock("@/features/auth/services/session", () => ({
  createGoogleRegistrationCompletedCookieHeader: vi.fn(
    () => "google_registration_status=registered; Path=/",
  ),
  getGoogleAuthSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/logger/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockedRegisterInitialUser = vi.mocked(registerInitialUser);
const mockedGetGoogleAuthSessionFromRequest = vi.mocked(
  getGoogleAuthSessionFromRequest,
);

const validBody = {
  name: "辻井啓悟",
  password: "password123",
  passwordConfirmation: "password123",
  address: "",
  phoneNumber: "",
  bankName: "信金中央金庫",
  bankCode: "1000",
  accountType: BankAccountType.Ordinary,
  branchName: "北海道",
  branchCode: "001",
  accountNumber: "5554833",
  accountHolder: "ツジイ　ケイゴ",
};

function createInitialRegistrationRequest({
  body = validBody,
  contentType = "application/json",
}: {
  body?: unknown;
  contentType?: string;
} = {}) {
  return new Request("http://localhost:3000/api/v1/auth/initial-registration", {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      "x-trace-id": "test-trace-id",
    },
    body: contentType.includes("application/json")
      ? JSON.stringify(body)
      : String(body),
  });
}

describe("POST /api/v1/auth/initial-registration", () => {
  beforeEach(() => {
    mockedRegisterInitialUser.mockReset();
    mockedGetGoogleAuthSessionFromRequest.mockReset();
  });

  it("returns 201 and app login path when initial registration succeeds", async () => {
    mockedGetGoogleAuthSessionFromRequest.mockReturnValue({
      googleVerifiedEmail: "k.tsujii@zpt-ai.com",
    });
    mockedRegisterInitialUser.mockResolvedValue({
      redirectPath: GOOGLE_AUTH_CONFIG.appLoginPath,
    });

    const response = await POST(createInitialRegistrationRequest());
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(response.headers.get("x-trace-id")).toBe("test-trace-id");
    expect(body).toEqual({
      data: {
        redirectPath: GOOGLE_AUTH_CONFIG.appLoginPath,
      },
    });
    const registerParams = mockedRegisterInitialUser.mock.calls[0]?.[0];

    expect(registerParams).toEqual({
      googleVerifiedEmail: "k.tsujii@zpt-ai.com",
      form: {
        accountHolder: validBody.accountHolder,
        accountNumber: validBody.accountNumber,
        accountType: validBody.accountType,
        address: null,
        bankName: validBody.bankName,
        branchName: validBody.branchName,
        name: validBody.name,
        password: validBody.password,
        passwordConfirmation: validBody.passwordConfirmation,
        phoneNumber: null,
      },
    });
    expect(registerParams?.form).not.toHaveProperty("bankCode");
    expect(registerParams?.form).not.toHaveProperty("branchCode");
  });

  it("returns 401 when Google verified email is missing", async () => {
    mockedGetGoogleAuthSessionFromRequest.mockReturnValue(null);

    const response = await POST(createInitialRegistrationRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(mockedRegisterInitialUser).not.toHaveBeenCalled();
  });

  it("returns 400 when content type is not JSON", async () => {
    mockedGetGoogleAuthSessionFromRequest.mockReturnValue({
      googleVerifiedEmail: "k.tsujii@zpt-ai.com",
    });

    const response = await POST(
      createInitialRegistrationRequest({
        body: "invalid body",
        contentType: "text/plain",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe("BAD_REQUEST");
    expect(mockedRegisterInitialUser).not.toHaveBeenCalled();
  });

  it("returns 400 when password confirmation does not match", async () => {
    mockedGetGoogleAuthSessionFromRequest.mockReturnValue({
      googleVerifiedEmail: "k.tsujii@zpt-ai.com",
    });

    const response = await POST(
      createInitialRegistrationRequest({
        body: {
          ...validBody,
          passwordConfirmation: "different123",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe("BAD_REQUEST");
    expect(mockedRegisterInitialUser).not.toHaveBeenCalled();
  });

  it("returns 409 when the user is already registered", async () => {
    mockedGetGoogleAuthSessionFromRequest.mockReturnValue({
      googleVerifiedEmail: "k.tsujii@zpt-ai.com",
    });
    mockedRegisterInitialUser.mockRejectedValue(
      new ConflictError("このメールアドレスはすでに登録されています。"),
    );

    const response = await POST(createInitialRegistrationRequest());
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.code).toBe("CONFLICT");
  });
});
