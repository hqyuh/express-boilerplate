import { authSchema } from '@/apis/auth/auth.schema';
import EHttpStatusCode from '@/common/constants/http-status-code';
import BadRequestException from '@/common/exceptions/bad-request-exception';
import type { TResponseCustom } from '@/common/interfaces/express';
import { SuccessResponse } from '@/common/success-response/success-response';
import type { NextFunction, Request } from 'express';

import AuthService from './auth.service';

/**
 * Handles authentication-related requests.
 */
class AuthController {
  /**
   * Handles the login request.
   * @param req The request object.
   * @param res The response object.
   * @param next The next function.
   */
  async login(req: Request, _res: TResponseCustom, _next: NextFunction) {
    const { success: isOk, data: schemaData, error } = authSchema.safeParse(req.body);

    if (!isOk) {
      throw new BadRequestException(error.errors);
    }

    const data = await AuthService.login(schemaData);

    return new SuccessResponse({
      status: EHttpStatusCode.OK,
      metadata: data,
    });
  }

  /**
   * Handles the getSession request.
   * @param req The request object.
   * @param res The response object.
   * @param next The next function.
   */
  async getMe(req: Request, _res: TResponseCustom, _next: NextFunction) {
    const {
      session: { username },
    } = req;
    const data = await AuthService.getMe(username);

    return new SuccessResponse({
      status: EHttpStatusCode.OK,
      metadata: data,
    });
  }
}

export default new AuthController();
