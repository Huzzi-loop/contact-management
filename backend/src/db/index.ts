import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { config } from '../config/env';

// Connection pool configuration
export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl:
    config.databaseUrl.includes('sslmode=require') ||
    config.databaseUrl.includes('supabase.com') ||
    config.isProduction
      ? { rejectUnauthorized: false }
      : false,
  max: config.isProduction ? 5 : 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Typed Drizzle database instance
export const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });

// Helper to check database connectivity
export const checkDbConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};
