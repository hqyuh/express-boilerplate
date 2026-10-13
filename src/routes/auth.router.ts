import { type Router as ExpressRouter, Router } from 'express';
import AuthController from '@/apis/auth/auth.controller';
import { ERoles } from '@/common/constants/roles';
import catchBlockCallback from '@/common/helper/catch-block-callback';
import { authMiddleware } from '@/common/middlewares/auth-middlewares';
import { cacheMiddleware } from '@/common/middlewares/cache-middleware';
import { roleMiddleware } from '@/common/middlewares/role-middlewares';

const authRouter: ExpressRouter = Router();

authRouter.post('/login', catchBlockCallback(AuthController.login));

authRouter.get(
  '/me',
  authMiddleware,
  roleMiddleware([ERoles.ADMIN, ERoles.USER]),
  cacheMiddleware(),
  catchBlockCallback(AuthController.getMe)
);

export default authRouter;
