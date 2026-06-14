import sql from "mssql";
import { env } from "./env";

const dbConfig: sql.config = {
  user: env.SA_USER,
  password: env.SA_PASSWORD,
  server: env.SQLSERVER_SERVER,
  database: env.SQLSERVER_DATABASE,
  port: env.SQLSERVER_PORT,
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