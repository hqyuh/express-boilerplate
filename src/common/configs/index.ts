import dotenv from 'dotenv';
import type { RedisOptions } from 'ioredis';
import { type DataSourceOptions } from 'typeorm';

import type { IENV } from '../interfaces/env';

dotenv.config();
class ConfigService {
  getEnv(key: keyof IENV): string {
    if (!process.env[key]) {
      throw new Error(key + ' environment variable does not set');
    }

    return process.env[key];
  }

  get postgresConfig(): DataSourceOptions {
    return {
      schema: this.schema,
      host: this.getEnv('DB_HOST'),
      port: Number.parseInt(this.getEnv('DB_PORT')),
      username: this.getEnv('DB_USERNAME'),
      password: this.getEnv('DB_PASSWORD'),
      database: this.getEnv('DB_DATABASE'),
      type: 'postgres',
      // synchronize: this.isDevelopment ? true : false,
      logging: this.isDevelopment,
    };
  }

  get redisConfig(): RedisOptions {
    return {
      // eslint-disable-next-line max-len
      host: process.env.DOCKER_CONTAINER === 'true' ? this.getEnv('REDIS_HOST_DOCKER') : this.getEnv('REDIS_HOST'),
      port: Number.parseInt(this.getEnv('REDIS_PORT')),
      db: Number.parseInt(this.getEnv('REDIS_DB')),
      password: this.getEnv('REDIS_PASSWORD'),
    };
  }

  get schema(): 'dev' | 'prod' {
    return this.isProduction ? 'prod' : 'dev';
  }

  get isProduction(): boolean {
    return this.getEnv('NODE_ENV') === 'production';
  }

  get isDevelopment(): boolean {
    return this.getEnv('NODE_ENV') === 'development';
  }

  get contextPath(): string {
    return this.getEnv('CONTEXT_PATH');
  }

  get portServer(): number {
    return Number.parseInt(this.getEnv('PORT'));
  }

  get hostServer(): string {
    return this.getEnv('HOST');
  }

  get accessTokenSecretKey(): string {
    return this.getEnv('ACCESS_TOKEN_SECRET_KEY');
  }

  get accessTokenExpiredTime() {
    return this.getEnv('ACCESS_TOKEN_EXPIRES_IN');
  }

  get refreshTokenSecretKey(): string {
    return this.getEnv('REFRESH_TOKEN_SECRET_KEY');
  }

  get refreshTokenExpiredTime() {
    return this.getEnv('REFRESH_TOKEN_EXPIRES_IN');
  }
}

const config = new ConfigService();

export default config;
