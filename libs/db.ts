import { Pool, type PoolConfig, type QueryResultRow } from "pg";
import { getEnv } from "@/libs/server/env/get-env";
import { getRequiredEnv } from "@/libs/server/env/get-required-env";
import { type DbConnection, type DbQueryParams } from "@/types/db";

const DEFAULT_DB_PORT = 5432;
const DEFAULT_DB_CONNECTION_TIMEOUT_MS = 10000;
const MIN_DB_PORT = 1;
const MAX_DB_PORT = 65535;

const DB_ENV_KEYS = {
  host: "DB_HOST",
  port: "DB_PORT",
  user: "DB_USER",
  password: "DB_PASSWORD",
  database: "DB_NAME",
  sslRejectUnauthorized: "DB_SSL_REJECT_UNAUTHORIZED",
} as const;

type GlobalWithDbPool = typeof globalThis & {
  rdsPool?: Pool;
};

function getDbPort() {
  const port = Number(getEnv(DB_ENV_KEYS.port) ?? DEFAULT_DB_PORT);

  if (!Number.isInteger(port) || port < MIN_DB_PORT || port > MAX_DB_PORT) {
    throw new Error("DB_PORT must be an integer between 1 and 65535.");
  }

  return port;
}

function getSslRejectUnauthorized() {
  const value = getEnv(DB_ENV_KEYS.sslRejectUnauthorized);

  return value !== "false";
}

function getRdsConfig(): PoolConfig {
  return {
    host: getRequiredEnv(DB_ENV_KEYS.host),
    port: getDbPort(),
    user: getRequiredEnv(DB_ENV_KEYS.user),
    password: getRequiredEnv(DB_ENV_KEYS.password),
    database: getRequiredEnv(DB_ENV_KEYS.database),
    connectionTimeoutMillis: DEFAULT_DB_CONNECTION_TIMEOUT_MS,
    ssl: {
      rejectUnauthorized: getSslRejectUnauthorized(),
    },
  };
}

function createRdsPool() {
  const globalWithDbPool = globalThis as GlobalWithDbPool;

  if (!globalWithDbPool.rdsPool) {
    globalWithDbPool.rdsPool = new Pool(getRdsConfig());
  }

  return globalWithDbPool.rdsPool;
}

function getRdsPool() {
  return createRdsPool();
}

export const db: DbConnection = {
  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: DbQueryParams,
  ) {
    return getRdsPool().query<T>(sql, params);
  },
};
