import { MsgIds, logger } from '@/common/logger/logger';
import dotenv from 'dotenv';

import createInstance from './app';

import 'reflect-metadata';

dotenv.config();
createInstance().catch((error) => {
  logger.writeWithError(MsgIds.M003002, error);
});
