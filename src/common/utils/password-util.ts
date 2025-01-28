import { compare } from 'bcryptjs';

export class PasswordUtils {
  static async comparePassword(password: string, passwordInDB: string): Promise<boolean> {
    // eslint-disable-next-line no-return-await
    return await compare(password, passwordInDB);
  }
}
