import dotenv from 'dotenv';
import { logger, MsgIds } from '@/common/logger/logger';

import createInstance from './app';

import 'reflect-metadata';

dotenv.config();
createInstance().catch((error) => {
  logger.writeWithError(MsgIds.M003002, error);
});
