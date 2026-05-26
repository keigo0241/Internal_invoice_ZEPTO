import { Pool, type PoolConfig, type QueryResultRow } from "pg";
import { type DbConnection, type DbQueryParams } from "@/types/db";

const DEFAULT_DB_PORT = 5432;

type GlobalWithDbPool = typeof globalThis & {
  rdsPool?: Pool;
};

function getRequiredEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function getDbPort() {
  const port = Number(process.env.DB_PORT ?? DEFAULT_DB_PORT);

  if (!Number.isInteger(port)) {
    throw new Error("DB_PORT must be an integer.");
  }

  return port;
}

function getRdsConfig(): PoolConfig {
  return {
    host: getRequiredEnv("DB_HOST"),
    port: getDbPort(),
    user: getRequiredEnv("DB_USER"),
    password: getRequiredEnv("DB_PASSWORD"),
    database: getRequiredEnv("DB_NAME"),
    ssl: {
      rejectUnauthorized: false,
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

const rdsPool = createRdsPool();

export const db: DbConnection = {
  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: DbQueryParams,
  ) {
    return rdsPool.query<T>(sql, params);
  },
};

export async function checkDbConnection() {
  await db.query("select 1");
}
