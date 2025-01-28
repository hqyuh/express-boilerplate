import EHttpStatusCode from '@/common/constants/http-status-code';
import type { ZodIssue } from 'zod';

import type { IErrorDetail } from '../interfaces/express';
import BaseException from './base-exception';

export default class ConflictRequestException extends BaseException {
  constructor(description: IErrorDetail | ZodIssue[]) {
    super({
      httpCode: EHttpStatusCode.CONFLICT,
      description,
    });
  }
}
