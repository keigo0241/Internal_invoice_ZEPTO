import { describe, expect, it } from "vitest";
import {
  filterHalfWidthAlphanumericInput,
  filterHalfWidthNumericInput,
} from "@/utils/validator/users/initial-registration-input-filter";

describe("initial registration input filters", () => {
  it("keeps only half-width alphanumerics", () => {
    expect(filterHalfWidthAlphanumericInput("abc１２3-DEFあ")).toBe("abc3DEF");
  });

  it("keeps only half-width numerics", () => {
    expect(filterHalfWidthNumericInput("１２3abc-456あ")).toBe("3456");
  });
});
