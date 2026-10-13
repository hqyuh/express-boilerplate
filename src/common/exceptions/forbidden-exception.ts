import type { $ZodIssue } from 'zod/v4/core';
import EHttpStatusCode from '@/common/constants/http-status-code';

import type { IErrorDetail } from '../interfaces/express';
import BaseException from './base-exception';

export default class ForbiddenException extends BaseException {
  constructor(description: IErrorDetail | $ZodIssue[]) {
    super({
      httpCode: EHttpStatusCode.FORBIDDEN,
      description,
    });
  }
}
