export type ApiContext = {
  request: Request;
  params?: Record<string, string>;
  traceId: string;
};

export type ApiResponseShape = {
  status?: number;
  headers?: HeadersInit;
  body?: unknown;
};

export type ApiHandlerResult = Response | ApiResponseShape | void;

export type ApiHandler = (ctx: ApiContext) => Promise<ApiHandlerResult>;

export type ApiGuard = (
  ctx: ApiContext,
) => Promise<ApiHandlerResult> | ApiHandlerResult;
