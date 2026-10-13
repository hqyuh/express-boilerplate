import { z } from 'zod';
import { logger, MsgIds } from '@/common/logger/logger';

export const authSchema = z.object({
  username: z.string().nonempty({
    message: logger.getMessage(MsgIds.M005003),
  }),
  password: z.string().nonempty({
    message: logger.getMessage(MsgIds.M005004),
  }),
});

export type TAuth = z.infer<typeof authSchema>;
