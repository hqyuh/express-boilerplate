import fs from 'node:fs';
import type http from 'node:http';
import path from 'node:path';
import cors from 'cors';
import express, {
  type ErrorRequestHandler,
  json,
  type Request,
  type RequestHandler,
  type Response,
  urlencoded,
} from 'express';
import expressHttpContext from 'express-http-context';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import RedisStore from 'rate-limit-redis';
import swaggerUI, { type JsonObject } from 'swagger-ui-express';
import YAML from 'yaml';
import config from '@/common/configs/index';
import baseExceptionHandler from '@/common/exceptions/handler/base-exception-handler';
import TooManyRequestException from '@/common/exceptions/too-many-request-exception';
import { logger, MsgIds } from '@/common/logger/logger';
import requestIdMiddleware from '@/common/middlewares/request-id-middleware';
import responseFinishMiddleware from '@/common/middlewares/response-finish-middleware';
import { cache } from '@/modules/cache/cache';
import { pgDatabase } from '@/modules/databases/PgDatabase';
import { socketIOManager } from '@/modules/ws/socket';
// import { websocketManager } from '@/modules/ws/websocket1';
// import { websocketManager } from '@/modules/ws/websocket';
import router from '@/routes';

const TIME_LIMIT = 15 * 60 * 1000; // 15 minutes
const REQUEST_LIMIT = 100;

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  baseExceptionHandler.handleError(err as Error, res);
};

export class App {
  public app: express.Application;

  public server!: http.Server;

  private swaggerDocument!: JsonObject;

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

      skip: (req) => req.originalUrl.startsWith(`${config.contextPath}/api-docs`),

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

      // process.exit(1);
    }
  }

  private middlewares() {
    this.app.set('trust proxy', 1);
    this.app.use(cors());
    // Helmet defaults break Swagger in the browser:
    // - upgrade-insecure-requests forces HTTPS on http://localhost:8080
    // - strict CSP blocks swagger-ui inline bootstrap
    // - CORP/HSTS also interfere with local HTTP access
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'upgrade-insecure-requests': null,
            'script-src': ["'self'", "'unsafe-inline'"],
            'style-src': ["'self'", "'unsafe-inline'", 'https:'],
            'img-src': ["'self'", 'data:'],
          },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        strictTransportSecurity: false,
      })
    );
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(expressHttpContext.middleware as RequestHandler);
    this.app.use(requestIdMiddleware);
    this.app.use(responseFinishMiddleware);
    this.app.use(this.createRateLimiter());
    // Yarn docker installs nest a second @types/express under multer; cast keeps both builds green.
    const swaggerServe = swaggerUI.serve as unknown as RequestHandler[];
    const swaggerSetup = swaggerUI.setup(this.swaggerDocument) as unknown as RequestHandler;
    this.app.use(`${config.contextPath}/api-docs`, ...swaggerServe, swaggerSetup);
  }

  private initializeErrorHandle() {
    this.app.use(errorHandler);
  }

  private routes() {
    this.app.use(config.contextPath, router);
  }

  closeServer() {
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
    logger.writeWithParameter(MsgIds.M003006, { URL: `${HOST}:${PORT}` });
  });

  // create ws
  // websocketManager.initializeWebSocket(instance.server);

  // socket.io
  socketIOManager.initializeSocketIO(instance.server);

  return instance;
};

export default createInstance;
