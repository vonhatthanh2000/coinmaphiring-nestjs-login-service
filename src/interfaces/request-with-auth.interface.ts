import { Request } from 'express';
import { AuthPayload } from './auth-payload.interface';

export interface RequestWithAuth extends Request {
  user: AuthPayload;
}
