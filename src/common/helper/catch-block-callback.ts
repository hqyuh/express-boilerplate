import type { SuccessResponse } from '@/common/success-response/success-response';
import type { NextFunction, Request, Response } from 'express';

const catchBlockCallback =
  // eslint-disable-next-line max-len
  <T>(fn: (req: Request, res: Response, next: NextFunction) => Promise<SuccessResponse<T>> | SuccessResponse<T>) =>
    (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next))
        .then((data) => res.status(data.status).json(data))
        .catch(next);
    };

export default catchBlockCallback;
