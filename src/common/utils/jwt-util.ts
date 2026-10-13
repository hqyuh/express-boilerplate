import * as jwt from 'jsonwebtoken';
import type { $ZodIssue } from 'zod/v4/core';
import type { ITokenDto } from '@/apis/auth/dto/token.dto';
import type { TStringValue } from '@/common/types/string-value';

import config from '../configs';
import type { IErrorDetail } from '../interfaces/express';

interface IVerifyOptions<K extends string = string, V = any> {
  jWTSecretKey: jwt.Secret | jwt.PublicKey;
  errorOptions?: IErrorDetail | $ZodIssue[];
  error?: (error: Error | null, decoded?: Record<K, V>) => void;
}

export default class JwtUtils {
  /**
   * Generates a JWT based on the provided JSON payload
   * @param json The JSON payload to be encoded in the token
   * @param expiresIn The expiration time for the token. Default to '7d'
   * @param signOptions The signOptions parameter is an optional object
   * @returns A promise the resolves to the generated token string
   */
  static sign<K extends string, V>(
    json: string | Buffer | Record<K, V>,
    jWTSecretKey: jwt.Secret | jwt.PrivateKey,
    options: jwt.SignOptions
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(json, jWTSecretKey, options, (error: Error | null, encoded: string | undefined) => {
        if (error) {
          reject(error);
        } else {
          resolve(encoded!);
        }
      });
    });
  }

  /**
   * Verifies the authenticity of a JWT token and returns the decoded payload.
   * @param token The JWT token to be verified.
   * @param verifyOptions - The verifyOptions parameter is an optional object
   * @returns A promise that resolves to the decoded payload.
   */
  static async verify<T, K extends string, V>(token: string, verifyOptions: IVerifyOptions): Promise<T> {
    const { jWTSecretKey, errorOptions, error: errorCallback } = verifyOptions;

    return new Promise((resolve, reject) => {
      jwt.verify(token, jWTSecretKey, (error, decoded) => {
        if (error) {
          if (errorCallback) {
            errorCallback(error, decoded as Record<K, V> | undefined);
          }

          reject(errorOptions ? new Error(JSON.stringify(errorOptions)) : error);
        } else {
          resolve(decoded as T);
        }
      });
    });
  }

  /**
   * Generates an access token and a refresh token based on the provided payload.
   *
   * @param payload - The payload to be included in the tokens.
   * @returns A promise that resolves to an object containing the access token and refresh token.
   */
  static async generateToken(payload: Record<string, any>): Promise<ITokenDto> {
    const [accessToken, refreshToken] = await Promise.all([
      JwtUtils.sign(payload, config.accessTokenSecretKey, {
        expiresIn: config.accessTokenExpiredTime as TStringValue,
      }),
      JwtUtils.sign(payload, config.refreshTokenSecretKey, {
        expiresIn: config.refreshTokenExpiredTime as TStringValue,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
