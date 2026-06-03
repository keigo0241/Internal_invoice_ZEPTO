export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "入力内容を確認してください。") {
    super(400, "BAD_REQUEST", message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "認証情報を確認できませんでした。") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "すでに登録されています。") {
    super(409, "CONFLICT", message);
  }
}
