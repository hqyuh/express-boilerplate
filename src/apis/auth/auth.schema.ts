import { MsgIds, logger } from '@/common/logger/logger';
import { z } from 'zod';

export const authSchema = z.object({
  username: z.string().nonempty({
    message: logger.getMessage(MsgIds.M005003),
  }),
  password: z.string().nonempty({
    message: logger.getMessage(MsgIds.M005004),
  }),
});

export type TAuth = z.infer<typeof authSchema>;
