import * as dotenv from 'dotenv';

dotenv.config();

// postgres
export const POSTGRES_HOST: string = process.env.POSTGRES_HOST || 'localhost';
export const POSTGRES_PORT: number = process.env.POSTGRES_PORT
  ? parseInt(process.env.POSTGRES_PORT, 10)
  : 5432;
export const POSTGRES_USER: string = process.env.POSTGRES_USER || 'postgres';
export const POSTGRES_PASSWORD: string =
  process.env.POSTGRES_PASSWORD || 'password';
export const POSTGRES_DB: string = process.env.POSTGRES_DB || 'login-service';

// mail
export const MAIL_HOST: string = process.env.MAIL_HOST || 'smtp.gmail.com';

export const MAIL_USER: string =
  process.env.MAIL_USER || 'thanhvo@codelight.co';

export const MAIL_PASSWORD = process.env.MAIL_PASSWORD || 'gntqwubmaiqfaagm';

export const MAIL_FROM: string =
  process.env.MAIL_FROM || 'thanhvo@codelight.co';

export const MAIL_VERIFY_CALLBACK: string =
  process.env.MAIL_VERIFY_CALLBACK || 'http://localhost:3000';

export const MAIL_VERIFY_HOST: string =
  process.env.MAIL_VERIFY_HOST || 'http://localhost:3001';

export const HOME: string = process.env.HOME || 'http://localhost:3000';

// jwt

export const ACCESS_TOKEN_SECRET: string =
  process.env.ACCESS_TOKEN_SECRET || 'access-token-secret';
// access token expires in 86400 seconds (1 days)
export const ACCESS_TOKEN_EXPIRES_IN: number = process.env
  .ACCESS_TOKEN_EXPIRES_IN
  ? parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN, 10)
  : 86400;

export const REFRESH_TOKEN_SECRET: string =
  process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret';
// refresh token expires in 604800 seconds (7 days)
export const REFRESH_TOKEN_EXPIRES_IN: number = process.env
  .REFRESH_TOKEN_EXPIRES_IN
  ? parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN, 10)
  : 604800;

// Goolge OAuth2

export const GOOGLE_CLIENT_ID: string =
  process.env.GOOGLE_CLIENT_ID ||
  '764611206424-jp41753hn12gb0r0ruih2431hkbp9j4g.apps.googleusercontent.com';

export const GOOGLE_CLIENT_SECRET: string =
  process.env.GOOGLE_CLIENT_SECRET || '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';

export const GOOGLE_CALLBACK_URL: string =
  process.env.GOOGLE_CALLBACK_URL ||
  'http://localhost:3001/auth/google/callback';
