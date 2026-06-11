import { type AppLoginForm } from "@/features/auth/types/app-login";
import { BadRequestError } from "@/lib/api/errors";
import { isEmailLike, normalizeEmail } from "@/utils/validator/input/email";

function parseAppLoginBody(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new BadRequestError("入力内容を確認してください。");
  }

  return body as Record<string, unknown>;
}

function getRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string") {
    throw new BadRequestError(`${fieldName}を入力してください。`);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new BadRequestError(`${fieldName}を入力してください。`);
  }

  return normalizedValue;
}

export function parseAppLoginForm(body: unknown): AppLoginForm {
  const values = parseAppLoginBody(body);
  const normalizedEmail = normalizeEmail(
    getRequiredString(values.email, "メールアドレス"),
  );
  const password = getRequiredString(values.password, "パスワード");

  if (!isEmailLike(normalizedEmail)) {
    throw new BadRequestError("メールアドレスを確認してください。");
  }

  return {
    email: normalizedEmail,
    password,
  };
}
