import { describe, expect, it } from "vitest";
import { parseAppLoginForm } from "@/features/auth/schemas/app-login-schema";
import { BadRequestError } from "@/lib/api/errors";

describe("parseAppLoginForm", () => {
  it("normalizes email and returns login form", () => {
    expect(
      parseAppLoginForm({
        email: " KEIGO@ZPT-AI.COM ",
        password: "password123",
      }),
    ).toEqual({
      email: "keigo@zpt-ai.com",
      password: "password123",
    });
  });

  it("throws when email is invalid", () => {
    expect(() =>
      parseAppLoginForm({
        email: "invalid-email",
        password: "password123",
      }),
    ).toThrow(BadRequestError);
  });

  it("throws when password is empty", () => {
    expect(() =>
      parseAppLoginForm({
        email: "keigo@zpt-ai.com",
        password: "",
      }),
    ).toThrow(BadRequestError);
  });
});
