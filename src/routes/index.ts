import { type RequestHandler, Router } from 'express';

import AuthRouter from './auth.router';
import UploadRouter from './upload.router';

const router: Router = Router();

const healthCheck: RequestHandler = (_req, res) => {
  res.status(200).json({ status: 'UP' });
};

router.get('/health', healthCheck);

router.use('/auth', AuthRouter);
router.use('/upload', UploadRouter);

export default router;
