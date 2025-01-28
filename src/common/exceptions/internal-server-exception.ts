import EHttpStatusCode from '@/common/constants/http-status-code';
import { MsgIds } from '@/common/logger/logger';

import BaseException from './base-exception';

export default class InternalServerException extends BaseException {
  constructor(errorMessage: string) {
    super({
      httpCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
      description: {
        errorCode: MsgIds.M003003,
        errorMessage,
      },
    });
  }
}
