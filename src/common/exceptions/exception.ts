import type { $ZodIssue } from 'zod/v4/core';
import type EHttpStatusCode from '@/common/constants/http-status-code';

import type { IErrorDetail } from '../interfaces/express';
import BaseException from './base-exception';

export default class Exception extends BaseException {
  constructor(description: IErrorDetail | $ZodIssue[], httpCode: EHttpStatusCode) {
    super({
      httpCode,
      description,
    });
  }
}
