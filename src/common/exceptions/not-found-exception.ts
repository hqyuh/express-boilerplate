import EHttpStatusCode from '@/common/constants/http-status-code';

import type { IErrorDetail } from '../interfaces/express';
import BaseException from './base-exception';

export default class NotFoundException extends BaseException {
  constructor(description: IErrorDetail) {
    super({
      httpCode: EHttpStatusCode.NOT_FOUND,
      description,
    });
  }
}
