import { describe, expect, it, vi } from "vitest";
import { AUTH_COOKIE_NAMES, GOOGLE_AUTH_CONFIG } from "@/constants/auth";
import { POST } from "@/app/api/v1/auth/logout/route";

vi.mock("@/lib/logger/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

function createLogoutRequest() {
  return new Request("http://localhost:3000/api/v1/auth/logout", {
    method: "POST",
    headers: {
      "x-trace-id": "test-trace-id",
    },
  });
}

describe("POST /api/v1/auth/logout", () => {
  it("clears auth cookies and returns login path", async () => {
    const response = await POST(createLogoutRequest());
    const body = await response.json();
    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(body).toEqual({
      data: {
        redirectPath: GOOGLE_AUTH_CONFIG.loginPath,
      },
    });
    expect(setCookie).toContain(AUTH_COOKIE_NAMES.googleVerifiedEmail);
    expect(setCookie).toContain(AUTH_COOKIE_NAMES.cognitoIdToken);
    expect(setCookie).toContain("Max-Age=0");
  });
});
