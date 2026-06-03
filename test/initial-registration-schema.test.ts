import { describe, expect, it } from "vitest";
import { parseInitialRegistrationForm } from "@/features/auth/schemas/initial-registration-schema";
import { BadRequestError } from "@/lib/api/errors";

const validForm = {
  name: "辻井啓悟",
  password: "password123",
  passwordConfirmation: "password123",
  bankName: "〇〇銀行",
  accountType: "ordinary",
  branchName: "〇〇支店",
  accountNumber: "1234567",
  accountHolder: "ツジイ ケイゴ",
};

describe("parseInitialRegistrationForm", () => {
  it("returns trimmed values when the form is valid", () => {
    expect(
      parseInitialRegistrationForm({
        ...validForm,
        name: " 辻井啓悟 ",
      }),
    ).toMatchObject({
      name: "辻井啓悟",
    });
  });

  it("throws when password confirmation does not match", () => {
    expect(() =>
      parseInitialRegistrationForm({
        ...validForm,
        passwordConfirmation: "different123",
      }),
    ).toThrow(BadRequestError);
  });

  it("throws when required fields are missing", () => {
    expect(() =>
      parseInitialRegistrationForm({
        ...validForm,
        bankName: "",
      }),
    ).toThrow(BadRequestError);
  });
});
