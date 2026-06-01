import { handleApiError } from "@/lib/api/handle-api-errors";
import { runGuards } from "@/lib/api/pipeline";
import { toResponse } from "@/lib/api/response";
import {
  type ApiContext,
  type ApiGuard,
  type ApiHandler,
} from "@/lib/api/types";

async function createApiContext(
  request: Request,
  traceId: string,
  routeContext?: { params?: Promise<Record<string, string>> },
): Promise<ApiContext> {
  const params = routeContext?.params ? await routeContext.params : undefined;

  return {
    request,
    params,
    traceId,
  };
}

function applyTraceIdHeader(response: Response, traceId: string): Response {
  response.headers.set("x-trace-id", traceId);

  return response;
}

function getTraceId(request: Request) {
  return request.headers.get("x-trace-id") ?? crypto.randomUUID();
}

export function withApi(handler: ApiHandler, guards: ApiGuard[] = []) {
  return async (
    request: Request,
    routeContext?: { params?: Promise<Record<string, string>> },
  ): Promise<Response> => {
    const traceId = getTraceId(request);
    const ctx = await createApiContext(request, traceId, routeContext);

    try {
      const guardResult = await runGuards(ctx, guards);

      if (typeof guardResult !== "undefined") {
        return applyTraceIdHeader(toResponse(guardResult), traceId);
      }

      const result = await handler(ctx);

      return applyTraceIdHeader(toResponse(result), traceId);
    } catch (error) {
      return handleApiError({
        error,
        request,
        traceId,
      });
    }
  };
}
