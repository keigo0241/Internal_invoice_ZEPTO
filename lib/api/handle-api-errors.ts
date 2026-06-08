import { AppError } from "@/lib/api/errors";
import { logger } from "@/lib/logger/logger";

type HandleApiErrorParams = {
  error: unknown;
  request: Request;
  traceId: string;
};

export function handleApiError({
  error,
  request,
  traceId,
}: HandleApiErrorParams): Response {
  if (error instanceof AppError) {
    logger.warn({
      message: "API request failed with expected error.",
      context: {
        method: request.method,
        path: new URL(request.url).pathname,
        traceId,
        code: error.code,
      },
      error,
    });

    return Response.json(
      {
        code: error.code,
        message: error.message,
        traceId,
      },
      {
        status: error.statusCode,
        headers: {
          "Content-Type": "application/problem+json",
          "x-Trace-Id": traceId,
        },
      },
    );
  }

  logger.error({
    message: "API request failed.",
    context: {
      method: request.method,
      path: new URL(request.url).pathname,
      traceId,
    },
    error,
  });

  return Response.json(
    {
      code: "INTERNAL_SERVER_ERROR",
      message: "予期しないエラーが発生しました。",
      traceId,
    },
    {
      status: 500,
      headers: {
        "Content-Type": "application/problem+json",
        "x-Trace-Id": traceId,
      },
    },
  );
}
