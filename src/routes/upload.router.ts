import { type Router as ExpressRouter, Router } from 'express';
import UploadController from '@/apis/upload/upload.controller';
import { ERoles } from '@/common/constants/roles';
import catchBlockCallback from '@/common/helper/catch-block-callback';
import { authMiddleware } from '@/common/middlewares/auth-middlewares';
import { roleMiddleware } from '@/common/middlewares/role-middlewares';
import { uploadMiddleware } from '@/common/upload/upload';

const uploadRouter: ExpressRouter = Router();

uploadRouter.post(
  '/',
  authMiddleware,
  roleMiddleware([ERoles.ADMIN, ERoles.USER]),
  uploadMiddleware('file', false),
  catchBlockCallback(UploadController.uploadFile)
);

export default uploadRouter;
