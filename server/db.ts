// Database connection for admin operations
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "FATAL: Missing DATABASE_URL. Set DATABASE_URL (or DATABASE_URL_POOLER) as an environment variable or Cloud Run secret.",
  );
  // Don't throw at module‐import time — let the health check respond so
  // Cloud Run can at least see the container is alive and report the real error in logs.
}

const pool = new Pool({
  connectionString: connectionString || "postgresql://placeholder:5432/placeholder",
  ssl: connectionString
    ? { rejectUnauthorized: false }
    : undefined,
  // Fail fast if the connection string is wrong instead of hanging
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { schema });
export { pool };
