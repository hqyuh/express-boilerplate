import type { RequestHandler } from 'express';
import expressHttpContext from 'express-http-context';
import { logger, MsgIds } from '@/common/logger/logger';

/**
 * Registers a listener that runs after the response has been sent to the client.
 */
const responseFinishMiddleware: RequestHandler = (req, res, next) => {
  const startAt = Date.now();

  res.on('finish', () => {
    logger.writeWithParameter(MsgIds.M0030013, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startAt,
      requestId: expressHttpContext.get('requestId'),
    });
  });

  next();
};

export default responseFinishMiddleware;
