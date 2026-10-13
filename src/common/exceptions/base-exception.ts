import type { $ZodIssue } from 'zod/v4/core';
import type { IErrorArgs } from '../interfaces/error';
import type { IErrorDetail } from '../interfaces/express';

export default class BaseException extends Error {
  public readonly httpCode: number;

  public readonly isOperational: boolean = true;

  public readonly errors: IErrorDetail | $ZodIssue[];

  constructor(args: IErrorArgs) {
    super(JSON.stringify(args.description));

    // If description is an array, map it to a new format
    this.errors = args.description;

    Object.setPrototypeOf(this, new.target.prototype);
    this.httpCode = args.httpCode;

    if (args.isOperational !== undefined) {
      this.isOperational = args.isOperational;
    }
  }
}
