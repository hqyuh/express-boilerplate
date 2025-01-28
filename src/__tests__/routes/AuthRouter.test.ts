/* eslint-disable max-len */
import type { ResponseLoginDto } from '@/apis/auth/dto/auth.dto';
import { App } from '@/app';
import config from '@/common/configs';
import PgDatabase from '@/modules/databases/PgDatabase';
import { decode } from 'jsonwebtoken';
import request from 'supertest';

import account from '../mocks/account.json';
import TC_LOGIN_001 from '../mocks/auth/login/TC_001.json';
import TC_LOGIN_002 from '../mocks/auth/login/TC_002.json';
import TC_LOGIN_003 from '../mocks/auth/login/TC_003.json';
import TC_SESSION_001 from '../mocks/auth/session/TC_001.json';
import TC_SESSION_002 from '../mocks/auth/session/TC_002.json';
import TC_SESSION_003 from '../mocks/auth/session/TC_003.json';

process.env.PORT = '4000';
const server = new App();
describe('Auth Routes', () => {
  const prefix = `${config.contextPath}`;
  const loginPath = `${prefix}/auth/login`;
  const sessionPath = `${prefix}/auth/me`;
  const dataSource = new PgDatabase();

  beforeAll(async () => {
    await dataSource.connect();
  });

  afterAll(async () => {
    await dataSource.connection.destroy();
    server.closeServer();
  });

  describe('Login', () => {
    test('TC_LOGIN_001: API login - Username is not existed', async () => {
      const res = await request(server.app).post(loginPath).send(account.accountFailedUsername);
      expect(res.body).toStrictEqual(TC_LOGIN_001);
    });

    test('TC_LOGIN_002: API login - Password does not match', async () => {
      const res = await request(server.app).post(loginPath).send(account.accountFailedPassword);
      expect(res.body).toStrictEqual(TC_LOGIN_002);
    });

    test('TC_LOGIN_003: API login - loginId or password is empty', async () => {
      const res = await request(server.app).post(loginPath);
      expect(res.body).toStrictEqual(TC_LOGIN_003);
    });

    test('TC_LOGIN_004: API Login - Success', async () => {
      const res = await request(server.app).post(loginPath).send(account.account);
      const data = res.body.data as ResponseLoginDto;
      const username = (decode(data.accessToken ?? '') as { username: string }).username;
      expect(username).toBe(data.user.username);
    });
  });

  describe('Get Session', () => {
    test('TC_SESSION_001: API get session with authorization', async () => {
      const resLogin = await request(server.app).post(loginPath).send(account.account);
      const data = resLogin.body.data as ResponseLoginDto;
      const res = await request(server.app).get(sessionPath).set('Authorization', `Bearer ${data.accessToken}`);
      expect(res.body).toStrictEqual(TC_SESSION_001);
    });

    test('TC_SESSION_002: API get session without authorization', async () => {
      const res = await request(server.app).get(sessionPath);
      expect(res.body).toStrictEqual(TC_SESSION_002);
    });

    test('TC_SESSION_003: API get session with authorization and username is not exists', async () => {
      await dataSource.connection.query('BEGIN');

      try {
        const resLogin = await request(server.app).post(loginPath).send(account.account);
        const accessToken = resLogin.body.data.accessToken;
        await dataSource.connection.query(`DELETE FROM ${config.schema}.user WHERE username = $1`, ['user']);
        const res = await request(server.app).get(sessionPath).set('Authorization', `Bearer ${accessToken}`);
        expect(res.body).toStrictEqual(TC_SESSION_003);
      } finally {
        await dataSource.connection.query('ROLLBACK');
      }
    });
  });
});
