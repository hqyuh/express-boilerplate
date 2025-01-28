import type { User } from '@/modules/databases/entities/user';

// RequestLoginDto represents the data required for a login request
export class RequestLoginDto {
  username: string;

  password: string;
}

// ResponseLoginDto represents the data returned after a successful login
export class ResponseLoginDto {
  accessToken?: string;

  refreshToken?: string;

  user: Partial<User>;

  constructor(data: Partial<User>, accessToken?: string, refreshToken?: string) {
    this.user = data;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
