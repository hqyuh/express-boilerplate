import { randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';
import expressHttpContext from 'express-http-context';

/**
 * Middleware function to generate and set a unique request ID in the Express HTTP context.
 * @param _req - The Express request object.
 * @param _res - The Express response object.
 * @param next - The next function to be called in the middleware chain.
 */
const requestIdMiddleware: RequestHandler = (_req, _res, next) => {
  expressHttpContext.set('requestId', randomUUID());
  next();
};

export default requestIdMiddleware;
