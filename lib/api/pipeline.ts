import {
  type ApiContext,
  type ApiGuard,
  type ApiHandlerResult,
} from "@/lib/api/types";

function hasPipelineResult(result: ApiHandlerResult): result is Exclude<
  ApiHandlerResult,
  void
> {
  return typeof result !== "undefined";
}

export async function runGuards(
  ctx: ApiContext,
  guards: ApiGuard[],
): Promise<ApiHandlerResult | undefined> {
  for (const guard of guards) {
    const result = await guard(ctx);

    if (hasPipelineResult(result)) {
      return result;
    }
  }
}
