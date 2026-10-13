import Redis from 'ioredis';
import config from '@/common/configs';
import { logger, MsgIds } from '@/common/logger/logger';

export default class Cache {
  readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      ...config.redisConfig,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.redis.ping();
      logger.write(MsgIds.M006001);
    } catch (error) {
      logger.writeWithError(MsgIds.M006002, error as Error);

      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      await this.redis.quit();
      logger.write(MsgIds.M006003);
    } catch (error) {
      logger.writeWithError(MsgIds.M006004, error as Error);
    }
  }
}

export const cache = new Cache();
