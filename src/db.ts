import sql from "mssql";
import { env } from "./env";

const dbConfig: sql.config = {
  user: env.SQLSERVER_USER,
  password: env.SQLSERVER_PASSWORD,
  server: env.SQLSERVER_SERVER,
  database: env.SQLSERVER_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getDb() {
  if (pool) {
    return pool;
  }

  pool = await new sql.ConnectionPool(dbConfig).connect();
  return pool;
}