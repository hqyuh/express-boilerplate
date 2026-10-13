import type { $ZodIssue } from 'zod/v4/core';

import type { IErrorDetail } from './express';

export interface IErrorArgs {
  httpCode: number;
  description: IErrorDetail | $ZodIssue[];
  isOperational?: boolean;
}
