import { describe, expect, it } from "vitest";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from "@/lib/api/errors";

describe("API errors", () => {
  it.each([
    [new BadRequestError(), 400, "BAD_REQUEST"],
    [new UnauthorizedError(), 401, "UNAUTHORIZED"],
    [new ForbiddenError(), 403, "FORBIDDEN"],
    [new NotFoundError(), 404, "NOT_FOUND"],
    [new ConflictError(), 409, "CONFLICT"],
    [new UnprocessableEntityError(), 422, "UNPROCESSABLE_ENTITY"],
    [new InternalServerError(), 500, "INTERNAL_SERVER_ERROR"],
  ])("sets status code and error code", (error, statusCode, code) => {
    expect(error.statusCode).toBe(statusCode);
    expect(error.code).toBe(code);
  });
});
