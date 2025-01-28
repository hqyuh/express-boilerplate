import EHttpStatusCode from '@/common/constants/http-status-code';
import { generateCacheKeyFromReq } from '@/common/utils/generate-cache.util';
import cacheService from '@/modules/cache/cache.service';
import type { NextFunction, Request, Response } from 'express';

const CACHE_PREFIX = 'hq_huy_cache';

export const cacheMiddleware =
  (time = 10_000) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cacheKey = `${CACHE_PREFIX}:${generateCacheKeyFromReq(req)}`;

      const cachedData = await cacheService.get(`${cacheKey}`);

      if (cachedData) {
        const data = JSON.parse(cachedData);

        return res.status(EHttpStatusCode.OK).json(data);
      }

      // eslint-disable-next-line no-console
      console.log(`Cache miss for ${cacheKey}`);

      const originalSend = res.send.bind(res);

      res.send = (body: unknown): Response => {
        res.send = originalSend;

        if (res.statusCode.toString().startsWith('2')) {
          const bodyToCache = typeof body === 'string' ? body : JSON.stringify(body);
          cacheService.set(cacheKey, bodyToCache, time).catch(console.error);
        }

        return originalSend(body);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
