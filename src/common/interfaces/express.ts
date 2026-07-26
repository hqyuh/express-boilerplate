/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Response } from 'express';
import type { ZodIssue } from 'zod';

export interface IErrorDetail {
  errorCode: string;
  errorMessage: string;
}

export interface IBodyResponse {
  httpStatusCode: number;
  data?: any;
  errors?: IErrorDetail | ZodIssue[];
}

export interface ISession {
  username: string;
  role: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session?: ISession;
    }
  }
}

export type TResponseCustom = Response<IBodyResponse>;
