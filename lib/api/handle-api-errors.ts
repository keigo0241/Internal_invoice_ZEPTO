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
