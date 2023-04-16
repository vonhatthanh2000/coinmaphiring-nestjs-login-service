import { User } from '@entities';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

export interface Request extends ExpressRequest {
  user: User;
}

export type Response = ExpressResponse;
