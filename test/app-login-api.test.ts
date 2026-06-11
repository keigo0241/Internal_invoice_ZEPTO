import { beforeEach, describe, expect, it, vi } from "vitest";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { loginAppUser } from "@/features/auth/services/app-login";
import { getGoogleAuthSessionFromRequest } from "@/features/auth/services/session";
import { POST } from "@/app/api/v1/auth/login/route";

vi.mock("@/features/auth/services/app-login", () => ({
  loginAppUser: vi.fn(),
}));

vi.mock("@/features/auth/services/session", () => ({
  createCognitoAuthSessionCookieHeaders: vi.fn(() => {
    const headers = new Headers();
    headers.append("Set-Cookie", "cognito_id_token=id-token; Path=/");

    return headers;
  }),
  getGoogleAuthSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/logger/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockedLoginAppUser = vi.mocked(loginAppUser);
const mockedGetGoogleAuthSessionFromRequest = vi.mocked(
  getGoogleAuthSessionFromRequest,
);

function createAppLoginRequest({
  body = {
    email: "keigo@zpt-ai.com",
    password: "password123",
  },
  contentType = "application/json",
}: {
  body?: unknown;
  contentType?: string;
} = {}) {
  return new Request("http://localhost:3000/api/v1/auth/login", {
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

describe("POST /api/v1/auth/login", () => {
  beforeEach(() => {
    mockedLoginAppUser.mockReset();
    mockedGetGoogleAuthSessionFromRequest.mockReset();
  });

  it("returns redirect path and Cognito token cookie when login succeeds", async () => {
    mockedGetGoogleAuthSessionFromRequest.mockReturnValue({
      googleVerifiedEmail: "keigo@zpt-ai.com",
    });
    mockedLoginAppUser.mockResolvedValue({
      redirectPath: GOOGLE_AUTH_CONFIG.successPath,
      tokens: {
        idToken: "id-token",
        accessToken: "access-token",
        refreshToken: "refresh-token",
      },
    });

    const response = await POST(createAppLoginRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("cognito_id_token");
    expect(body).toEqual({
      data: {
        redirectPath: GOOGLE_AUTH_CONFIG.successPath,
      },
    });
    expect(mockedLoginAppUser).toHaveBeenCalledWith({
      googleVerifiedEmail: "keigo@zpt-ai.com",
      form: {
        email: "keigo@zpt-ai.com",
        password: "password123",
      },
    });
  });

  it("returns 401 when Google auth session is missing", async () => {
    mockedGetGoogleAuthSessionFromRequest.mockReturnValue(null);

    const response = await POST(createAppLoginRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(mockedLoginAppUser).not.toHaveBeenCalled();
  });

  it("returns 400 when content type is not JSON", async () => {
    mockedGetGoogleAuthSessionFromRequest.mockReturnValue({
      googleVerifiedEmail: "keigo@zpt-ai.com",
    });

    const response = await POST(
      createAppLoginRequest({
        body: "invalid",
        contentType: "text/plain",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe("BAD_REQUEST");
    expect(mockedLoginAppUser).not.toHaveBeenCalled();
  });
});
