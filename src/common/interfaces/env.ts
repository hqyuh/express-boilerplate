export interface IENV {
  HOST: string | undefined;
  PORT: number | undefined;
  NODE_ENV: string | undefined;
  CONTEXT_PATH: string | undefined;
  DB_HOST: string | undefined;
  DB_PORT: number | undefined;
  DB_USERNAME: string | undefined;
  DB_PASSWORD: string | undefined;
  DB_DATABASE: string | undefined;
  DB_TYPE: 'postgres';
  ACCESS_TOKEN_SECRET_KEY: string | undefined;
  ACCESS_TOKEN_EXPIRES_IN: string | undefined;
  REFRESH_TOKEN_SECRET_KEY: string | undefined;
  REFRESH_TOKEN_EXPIRES_IN: string | undefined;

  // redis
  REDIS_HOST: string | undefined;
  REDIS_PORT: number | undefined;
  REDIS_DB: number | undefined;
  REDIS_PASSWORD: string | undefined;
  REDIS_PREFIX: string | undefined;

  // docker
  DOCKER_CONTAINER: string | undefined;
  REDIS_HOST_DOCKER: string | undefined;
}
