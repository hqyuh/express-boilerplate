import { Router, type RequestHandler } from 'express';

import AuthRouter from './auth.router';

const router: Router = Router();

const healthCheck: RequestHandler = (_req, res) => {
  res.status(200).json({ status: 'UP' });
};

router.get('/health', healthCheck);

router.use('/auth', AuthRouter);

export default router;
