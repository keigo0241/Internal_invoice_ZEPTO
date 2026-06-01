export type LogPayload = {
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
};
