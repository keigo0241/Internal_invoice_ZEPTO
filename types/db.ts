import { type QueryResult, type QueryResultRow } from "pg";

export type DbQueryParams = unknown[];

export interface DbConnection {
  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: DbQueryParams,
  ): Promise<QueryResult<T>>;
}
