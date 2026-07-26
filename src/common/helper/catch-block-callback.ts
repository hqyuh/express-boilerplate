import type { SuccessResponse } from '@/common/success-response/success-response';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

type THandler<T> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<SuccessResponse<T>> | SuccessResponse<T>;

const catchBlockCallback =
  <T>(fn: THandler<T>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .then((data) => res.status(data.status).json(data))
      .catch(next);
  };

export default catchBlockCallback;
