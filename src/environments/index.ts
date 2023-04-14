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
  process.env.MAIL_USER || 'nthanhatee@gmail.com';

export const MAIL_PASSWORD = process.env.MAIL_PASSWORD || 'ZXCzxc@021200';

export const MAIL_FROM: string =
  process.env.MAIL_FROM || 'nthanhatee@gmail.com';

export const MAIL_VERIFY_CALLBACK: string =
  process.env.MAIL_VERIFY_CALLBACK || 'http://localhost:3000';

export const MAIL_VERIFY_HOST: string =
  process.env.MAIL_VERIFY_HOST || 'http://localhost:3001';
