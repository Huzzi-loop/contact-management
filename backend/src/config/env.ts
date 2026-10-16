import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crm_db',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

if (!process.env.DATABASE_URL && (config.isProduction || process.env.VERCEL)) {
  console.warn('⚠️ WARNING: DATABASE_URL is not configured in Vercel environment variables! Using fallback localhost database.');
}

