import type { NextFunction, Request, Response } from 'express';
import expressHttpContext from 'express-http-context';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware function to generate and set a unique request ID in the Express HTTP context.
 * @param _req - The Express request object.
 * @param _res - The Express response object.
 * @param next - The next function to be called in the middleware chain.
 */
const requestIdMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  expressHttpContext.set('requestId', uuidv4());
  next();
};

export default requestIdMiddleware;
