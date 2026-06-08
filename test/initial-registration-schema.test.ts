import { describe, expect, it } from "vitest";
import { parseInitialRegistrationForm } from "@/features/auth/schemas/initial-registration-schema";
import { BankAccountType } from "@/features/users/types/bank-account";
import { BadRequestError } from "@/lib/api/errors";

const validForm = {
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
  accountNumber: "1234567",
  accountHolder: "ツジイ　ケイゴ",
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
      address: null,
      phoneNumber: null,
    });
  });

  it("returns trimmed optional address and phone number when entered", () => {
    expect(
      parseInitialRegistrationForm({
        ...validForm,
        address: " 東京都〇〇区〇〇 ",
        phoneNumber: " 09012345678 ",
      }),
    ).toMatchObject({
      address: "東京都〇〇区〇〇",
      phoneNumber: "09012345678",
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

  it("throws when password contains characters other than half-width alphanumerics", () => {
    expect(() =>
      parseInitialRegistrationForm({
        ...validForm,
        password: "password-123",
        passwordConfirmation: "password-123",
      }),
    ).toThrow(BadRequestError);
  });

  it("throws when bank fields contain half-width characters", () => {
    expect(() =>
      parseInitialRegistrationForm({
        ...validForm,
        bankName: "Yucho Bank",
      }),
    ).toThrow(BadRequestError);
  });

  it("throws when account number contains characters other than half-width digits", () => {
    expect(() =>
      parseInitialRegistrationForm({
        ...validForm,
        accountNumber: "123abc",
      }),
    ).toThrow(BadRequestError);
  });

  it("allows full-width alphanumerics and full-width spaces in full-width fields", () => {
    expect(
      parseInitialRegistrationForm({
        ...validForm,
        bankName: "信金中央金庫",
        bankCode: "1000",
        branchName: "北海道",
        branchCode: "001",
        accountHolder: "ツジイ　ケイゴ",
      }),
    ).toMatchObject({
      bankName: "信金中央金庫",
      branchName: "北海道",
      accountHolder: "ツジイ　ケイゴ",
    });
  });
});
