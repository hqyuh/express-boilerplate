/* eslint-disable max-len */
import BadRequestException from '@/common/exceptions/bad-request-exception';
import UnauthorizedException from '@/common/exceptions/unauthorized-exception';
import { MsgIds, logger } from '@/common/logger/logger';
import JwtUtils from '@/common/utils/jwt-util';
import { PasswordUtils } from '@/common/utils/password-util';
import { User } from '@/modules/databases/entities/user';

import { ResponseLoginDto, type RequestLoginDto } from './dto/auth.dto';

class AuthService {
  /**
   * Logs in a user and returns the login response.
   * @param data - The login request data.
   * @returns The login response.
   * @throws BadRequestException if the username is not found or the password is incorrect.
   */
  async login(data: RequestLoginDto): Promise<ResponseLoginDto> {
    const userInfo = await User.findOne({
      where: {
        username: data.username,
      },
      select: {
        username: true,
        password: true,
        role: true,
      },
    });

    if (!userInfo) {
      const parameters = { username: data.username };
      logger.writeWithParameter(MsgIds.M005001, parameters);

      throw new BadRequestException({
        errorCode: MsgIds.M005001,
        errorMessage: logger.getMessage(MsgIds.M005001),
      });
    }

    const isCheckMatchPassword = await PasswordUtils.comparePassword(data.password, userInfo.password);

    if (!isCheckMatchPassword) {
      const parameters = { username: data.username, password: data.password };
      logger.writeWithParameter(MsgIds.M005001, parameters);

      throw new BadRequestException({
        errorCode: MsgIds.M005001,
        errorMessage: logger.getMessage(MsgIds.M005001),
      });
    }

    const { accessToken, refreshToken } = await JwtUtils.generateToken({
      username: userInfo.username,
      role: userInfo.role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...rest } = userInfo;

    return new ResponseLoginDto(rest, accessToken, refreshToken);
  }

  /**
   * Retrieves user information by username.
   * @param username - The username of the user.
   * @returns The user information.
   * @throws UnauthorizedException if the username is not found.
   */
  async getMe(username: string): Promise<ResponseLoginDto> {
    const userInfo = await User.findOne({
      where: {
        username,
      },
      select: {
        username: true,
      },
    });

    if (!userInfo) {
      const parameters = { username };
      logger.writeWithParameter(MsgIds.M005002, parameters);

      throw new UnauthorizedException({
        errorCode: MsgIds.M005002,
        errorMessage: logger.getMessage(MsgIds.M005002),
      });
    }

    return new ResponseLoginDto(userInfo);
  }
}

export default new AuthService();
