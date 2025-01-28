import JwtUtils from '@/common/utils/jwt-util';
import type { NextFunction, Request } from 'express';

import config from '../configs';
import UnauthorizedException from '../exceptions/unauthorized-exception';
import type { ISession, TResponseCustom } from '../interfaces/express';
import { MsgIds, logger } from '../logger/logger';

export const authMiddleware = async (req: Request, _res: TResponseCustom, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      const parameters = { reason: 'The token is missing' };
      logger.writeWithParameter(MsgIds.M005002, parameters);

      throw new UnauthorizedException({
        errorCode: MsgIds.M005002,
        errorMessage: logger.getMessage(MsgIds.M005002),
      });
    }

    const userInfo = await JwtUtils.verify<ISession, string, unknown>(token, {
      error(__, _) {
        const parameters = { reason: 'Verify token failed' };
        logger.writeWithParameter(MsgIds.M005002, parameters);

        throw new UnauthorizedException({
          errorCode: MsgIds.M005002,
          errorMessage: logger.getMessage(MsgIds.M005002),
        });
      },
      jWTSecretKey: config.accessTokenSecretKey,
    });
    req.session = userInfo;
    next();
  } catch (error) {
    next(error);
  }
};
