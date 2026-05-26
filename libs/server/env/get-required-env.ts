import { getEnv } from "@/libs/server/env/get-env";

export function getRequiredEnv(key: string) {
  const value = getEnv(key);

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}
