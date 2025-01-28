import { cache } from '@/modules/cache/cache';

export class CacheService {
  async set(key: string, value: string, expired: string | number): Promise<'OK'> {
    await this.del(key);

    return cache.redis.set(key, value, 'EX', expired);
  }

  async setNx(key: string, value: string): Promise<number> {
    await this.del(key);

    return cache.redis.setnx(key, value);
  }

  get(key: string): Promise<string | null> {
    return cache.redis.get(key);
  }

  del(key: string) {
    return cache.redis.del(key);
  }

  keys(prefix: string) {
    return cache.redis.keys(`${prefix}:*`);
  }
}

export default new CacheService();
