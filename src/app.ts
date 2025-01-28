/* eslint-disable max-len */
import fs from 'fs';
import type http from 'http';
import path from 'path';

import config from '@/common/configs/index';
import baseExceptionHandler from '@/common/exceptions/handler/base-exception-handler';
import TooManyRequestException from '@/common/exceptions/too-many-request-exception';
import { MsgIds, logger } from '@/common/logger/logger';
import requestIdMiddleware from '@/common/middlewares/request-id-middleware';
import { cache } from '@/modules/cache/cache';
import { pgDatabase } from '@/modules/databases/PgDatabase';
import router from '@/routes';
import cors from 'cors';
import express, { json, urlencoded, type NextFunction, type Request, type Response } from 'express';
import expressHttpContext from 'express-http-context';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import RedisStore from 'rate-limit-redis';
import swaggerUI, { type JsonObject } from 'swagger-ui-express';
import YAML from 'yaml';

const TIME_LIMIT = 15 * 60 * 1000; // 15 minutes
const REQUEST_LIMIT = 100;

export class App {
  public app: express.Application;

  public server: http.Server;

  private swaggerDocument: JsonObject;

  constructor() {
    this.app = express();
    this.loadSwaggerDocument();
    this.middlewares();
    this.routes();
    this.initializeErrorHandle();
  }

  private createRateLimiter() {
    return rateLimit({
      // Rate limiter configuration
      windowMs: TIME_LIMIT, // 15 minutes
      max: REQUEST_LIMIT, // Limit each IP to 3 requests per `window` (here, per 15 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers

      skip: (req) => req.originalUrl.startsWith(config.contextPath + '/api-docs'),

      // Redis store configuration
      store: new RedisStore({
        // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
        sendCommand: (...args: string[]) => cache.redis.call(...args),
      }),
      handler: (_req: Request, res: Response) => {
        res.status(429).json(
          new TooManyRequestException({
            errorCode: MsgIds.M003005,
            errorMessage: logger.getMessage(MsgIds.M003005),
          })
        );
      },
    });
  }

  private loadSwaggerDocument() {
    try {
      const file = fs.readFileSync(path.resolve('example-swagger.yaml'), 'utf8');
      this.swaggerDocument = YAML.parse(file);
    } catch (error) {
      console.error('Error loading Swagger document:', error);

      throw new Error('Error loading Swagger document');
      // eslint-disable-next-line unicorn/no-process-exit
      // process.exit(1);
    }
  }

  private middlewares() {
    this.app.set('trust proxy', 1);
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(expressHttpContext.middleware);
    this.app.use(requestIdMiddleware);
    this.app.use(this.createRateLimiter());
    this.app.use(config.contextPath + '/api-docs', swaggerUI.serve, swaggerUI.setup(this.swaggerDocument));
  }

  private initializeErrorHandle() {
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      baseExceptionHandler.handleError(err, res);
    });
  }

  private routes() {
    this.app.use(config.contextPath, router);
  }

  closeServer() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.server) {
      this.server.close();
    }
  }
}

const createInstance = async () => {
  // starting migrate to database
  await pgDatabase.connect();

  // Create instance app
  const instance = new App();

  // redis connect
  await cache.connect();

  const HOST = config.hostServer;
  // const PORT = config.portServer;
  const PORT = process.env.PORT ?? 9000;

  instance.server = instance.app.listen(PORT, () => {
    const parameters = { HOST, PORT: PORT.toString(), CONTEXT_PATH: config.contextPath };
    logger.writeWithParameter(MsgIds.M003001, parameters);
    logger.writeWithParameter(MsgIds.M003004, { URL: `${HOST}:${PORT}${config.contextPath}/api-docs` });
  });

  return instance;
};

export default createInstance;
