import type { NextFunction, Request } from 'express';
import EHttpStatusCode from '@/common/constants/http-status-code';
import BadRequestException from '@/common/exceptions/bad-request-exception';
import type { TResponseCustom } from '@/common/interfaces/express';
import { logger, MsgIds } from '@/common/logger/logger';
import { SuccessResponse } from '@/common/success-response/success-response';

class UploadController {
  async uploadFile(req: Request, _res: TResponseCustom, _next: NextFunction) {
    if (!req.file) {
      throw new BadRequestException({
        errorCode: MsgIds.M0030011,
        errorMessage: logger.getMessage(MsgIds.M0030011),
      });
    }

    return new SuccessResponse({
      status: EHttpStatusCode.OK,
      metadata: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      },
    });
  }
}

export default new UploadController();
