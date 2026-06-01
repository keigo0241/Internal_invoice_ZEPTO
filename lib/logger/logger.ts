import { type LogPayload } from "@/lib/logger/types";

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    };
  }

  return error;
}

function buildLogPayload(payload: LogPayload) {
  return {
    message: payload.message,
    context: payload.context,
    error: serializeError(payload.error),
  };
}

export const logger = {
  info(payload: LogPayload) {
    console.info(buildLogPayload(payload));
  },
  warn(payload: LogPayload) {
    console.warn(buildLogPayload(payload));
  },
  error(payload: LogPayload) {
    console.error(buildLogPayload(payload));
  },
};
