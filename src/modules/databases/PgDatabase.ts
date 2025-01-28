/* eslint-disable unicorn/no-process-exit */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import path from 'path';

import config from '@/common/configs';
import { MsgIds, logger } from '@/common/logger/logger';
import { DataSource } from 'typeorm';

export default class PgDatabase {
  readonly dataSource = new DataSource({
    ...config.postgresConfig,
    entities: [path.resolve(__dirname, 'entities/*.{ts,js}')],
  });

  connection: DataSource;

  async connect(): Promise<DataSource> {
    try {
      this.connection = await this.dataSource.initialize();
      logger.write(MsgIds.M002001);

      return this.connection;
    } catch (error) {
      logger.writeWithError(MsgIds.M002002, error);

      throw error;
    }
  }

  async clean(): Promise<void> {
    try {
      const entities = this.dataSource.entityMetadatas;
      const tableNames = entities.map((entity) => `"${entity.tableName}"`).join(', ');
      await this.dataSource.query(`TRUNCATE ${tableNames} CASCADE;`);
      logger.write(MsgIds.M002004);
    } catch (error) {
      logger.writeWithError(MsgIds.M002003, error);

      throw error;
    }
  }
}

export const pgDatabase = new PgDatabase();
