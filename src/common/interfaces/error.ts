import type { ZodIssue } from 'zod';

import type { IErrorDetail } from './express';

export interface IErrorArgs {
  httpCode: number;
  description: IErrorDetail | ZodIssue[];
  isOperational?: boolean;
}
