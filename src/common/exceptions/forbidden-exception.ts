import EHttpStatusCode from '@/common/constants/http-status-code';
import type { ZodIssue } from 'zod';

import type { IErrorDetail } from '../interfaces/express';
import BaseException from './base-exception';

export default class ForbiddenException extends BaseException {
  constructor(description: IErrorDetail | ZodIssue[]) {
    super({
      httpCode: EHttpStatusCode.FORBIDDEN,
      description,
    });
  }
}
