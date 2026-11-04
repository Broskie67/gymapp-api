import { Pool, QueryResultRow } from "pg";
import { env } from "./env";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export async function getDb() {
  return pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params: unknown[] = []
) {
  const result = await pool.query<T>(text, params);
  return result.rows;
}