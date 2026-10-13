import type { Response } from 'express';
import HttpStatusCode from '@/common/constants/http-status-code';
import type { IBodyResponse, IErrorDetail } from '@/common/interfaces/express';
import { logger, MsgIds } from '@/common/logger/logger';

import BaseException from '../base-exception';

class BaseExceptionHandler {
  public handleError(error: Error | BaseException, response?: Response): void {
    if (this.isTrustedError(error) && response) {
      this.handleTrustedError(error as BaseException, response);
    } else {
      this.handleUntrustedError(error, response);
    }
  }

  public isTrustedError(error: Error | BaseException): boolean {
    // Return true if error is an instance of BaseException and is operational
    return error instanceof BaseException && error.isOperational;
  }

  private handleTrustedError(error: BaseException, response: Response): void {
    const statusCode = error.httpCode;
    // If error.errors is not an array, wrap it in an array. Otherwise, use it as is.
    const errors = error.errors;
    const responseData: IBodyResponse = {
      httpStatusCode: statusCode,
      errors,
    };

    if (statusCode === HttpStatusCode.INTERNAL_SERVER_ERROR) {
      errors[0].errorMessage = 'Internal Server Error';
    }

    response.status(statusCode).json(responseData);
  }

  private handleUntrustedError(error: Error, response?: Response): void {
    const statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
    logger.writeWithError(MsgIds.M003003, error);
    const errorDetail: IErrorDetail = { errorCode: MsgIds.M003003, errorMessage: logger.getMessage(MsgIds.M003003) };
    const responseData: IBodyResponse = {
      httpStatusCode: statusCode,
      errors: errorDetail,
    };
    response?.status(statusCode).json(responseData);
  }
}

export default new BaseExceptionHandler();
