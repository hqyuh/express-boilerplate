import EHttpStatusCode from '@/common/constants/http-status-code';

import type { IErrorDetail } from '../interfaces/express';

export default class TooManyRequestException {
  httpStatusCode: EHttpStatusCode;

  description: IErrorDetail;

  constructor(description: IErrorDetail) {
    this.httpStatusCode = EHttpStatusCode.TOO_MANY_REQUESTS;
    this.description = description;
  }
}
