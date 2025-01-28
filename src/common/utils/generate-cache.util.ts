import type { Request } from 'express';
import hash from 'object-hash';

export const generateCacheKeyFromReq = (req: Request): string => {
  const data = {
    query: req.query,
  };

  return `${req.path}:${hash(data)}`;
};
