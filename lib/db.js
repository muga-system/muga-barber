import { neon } from "@neondatabase/serverless";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

export function getDb() {
  if (!connectionString) return null;
  return neon(connectionString);
}
