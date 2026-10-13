import type { Response } from 'express';
import type { $ZodIssue } from 'zod/v4/core';

export interface IErrorDetail {
  errorCode: string;
  errorMessage: string;
}

export interface IBodyResponse {
  httpStatusCode: number;
  data?: any;
  errors?: IErrorDetail | $ZodIssue[];
}

export interface ISession {
  username: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      session?: ISession;
    }
  }
}

export type TResponseCustom = Response<IBodyResponse>;
