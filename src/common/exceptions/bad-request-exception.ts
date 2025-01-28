import EHttpStatusCode from '@/common/constants/http-status-code';
import type { ZodIssue } from 'zod';

import type { IErrorDetail } from '../interfaces/express';
import BaseException from './base-exception';

export default class BadRequestException extends BaseException {
  constructor(description: IErrorDetail | ZodIssue[]) {
    super({
      httpCode: EHttpStatusCode.BAD_REQUEST,
      description,
    });
  }
}
