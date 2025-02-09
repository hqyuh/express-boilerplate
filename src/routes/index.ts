import { Router, type Request, type Response } from 'express';

import AuthRouter from './auth.router';

const router: Router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

router.use('/auth', AuthRouter);

export default router;
