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

export class ForbiddenError extends AppError {
  constructor(message = "アクセス権限がありません。") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "対象データが見つかりません。") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "すでに登録されています。") {
    super(409, "CONFLICT", message);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = "入力内容を処理できません。") {
    super(422, "UNPROCESSABLE_ENTITY", message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "予期しないエラーが発生しました。") {
    super(500, "INTERNAL_SERVER_ERROR", message);
  }
}
