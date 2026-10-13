import type { NextFunction, Request } from 'express';
import { logger, MsgIds } from '@/common/logger/logger';

import ForbiddenException from '../exceptions/forbidden-exception';
import type { TResponseCustom } from '../interfaces/express';

export const roleMiddleware = (ERoles: string[]) => (req: Request, _res: TResponseCustom, next: NextFunction) => {
  try {
    const role = req.session?.role;

    if (!role || !ERoles.includes(role)) {
      const parameters = { reason: 'You do not have permission' };
      logger.writeWithParameter(MsgIds.M005005, parameters);

      throw new ForbiddenException({
        errorCode: MsgIds.M005005,
        errorMessage: logger.getMessage(MsgIds.M005005),
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
