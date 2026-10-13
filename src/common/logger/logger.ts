import expressHttpContext from 'express-http-context';
import * as winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';
import config from '@/common/configs';

const LogFileName = {
  server: 'server',
} as const;

type TLogFileNameType = (typeof LogFileName)[keyof typeof LogFileName];

type TMsgLevelType = (typeof MsgLevel)[keyof typeof MsgLevel];

enum MsgLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly',
}

export enum MsgIds {
  // File
  M001001 = 'M001-001',

  // Database
  M002001 = 'M002-001',
  M002002 = 'M002-002',
  M002003 = 'M002-003',
  M002004 = 'M002-004',

  // Server
  M003001 = 'M003-001',
  M003002 = 'M003-002',
  M003003 = 'M003-003',
  M003004 = 'M003-004',
  M003005 = 'M003-005',
  M003006 = 'M003-006',
  M003007 = 'M003-007',
  M003008 = 'M003-008',
  M003009 = 'M003-009',
  M0030010 = 'M003-0010',
  M0030011 = 'M003-0011',
  M0030012 = 'M003-0012',
  M0030013 = 'M003-0013',

  // Login
  M005001 = 'M005-001',
  M005002 = 'M005-002',
  M005003 = 'M005-003',
  M005004 = 'M005-004',
  M005005 = 'M005-005',

  // Redis
  M006001 = 'M006-001',
  M006002 = 'M006-002',
  M006003 = 'M006-003',
  M006004 = 'M006-004',
}

const msgInfo = new Map<MsgIds, [TMsgLevelType, string]>([
  // File
  [MsgIds.M001001, [MsgLevel.WARN, 'File operation error']],

  // Database
  [MsgIds.M002001, [MsgLevel.INFO, 'Connect database successfully']],
  [MsgIds.M002002, [MsgLevel.ERROR, 'Connect database error']],
  [MsgIds.M002003, [MsgLevel.WARN, 'Access database error']],
  [MsgIds.M002004, [MsgLevel.INFO, 'Clean database successfully']],

  // Server
  [MsgIds.M003001, [MsgLevel.INFO, 'Server is running']],
  [MsgIds.M003002, [MsgLevel.ERROR, 'Create server failed']],
  [MsgIds.M003003, [MsgLevel.ERROR, 'The server has encountered an unexpected error']],
  [MsgIds.M003004, [MsgLevel.INFO, 'The swagger is running']],
  [MsgIds.M003005, [MsgLevel.ERROR, 'Too many requests from this IP, please try again after 15 minutes']],
  [MsgIds.M003006, [MsgLevel.INFO, 'The socket is running']],
  [MsgIds.M003007, [MsgLevel.ERROR, 'Images only! (jpeg, jpg, png, gif)']],
  [MsgIds.M003008, [MsgLevel.ERROR, 'Video only! (mp4, avi, mov, mkv, wmv)']],
  [MsgIds.M003009, [MsgLevel.ERROR, 'Upload file or video error']],
  [MsgIds.M0030010, [MsgLevel.ERROR, 'File too large. Maximum allowed size is {type}MB.']],
  [MsgIds.M0030011, [MsgLevel.ERROR, 'Unexpected file field']],
  [MsgIds.M0030012, [MsgLevel.ERROR, 'File only! (pdf, xlsx, docx)']],
  [MsgIds.M0030013, [MsgLevel.INFO, 'Request completed']],

  // Login
  [MsgIds.M005001, [MsgLevel.ERROR, 'The username or password is incorrect']],
  [MsgIds.M005002, [MsgLevel.ERROR, 'Not authenticated']],
  [MsgIds.M005003, [MsgLevel.ERROR, 'Username cannot be empty']],
  [MsgIds.M005004, [MsgLevel.ERROR, 'Password cannot be empty']],
  [MsgIds.M005005, [MsgLevel.ERROR, 'You do not have permission']],

  // Redis
  [MsgIds.M006001, [MsgLevel.INFO, 'Connect redis successfully']],
  [MsgIds.M006002, [MsgLevel.ERROR, 'Connect redis error']],
  [MsgIds.M006003, [MsgLevel.INFO, 'Disconnected from Redis']],
  [MsgIds.M006004, [MsgLevel.ERROR, 'Error while disconnecting from redis']],
]);

class WinstonLogger {
  private readonly _prodTransports: WinstonDaily[];

  private readonly _localTransports: winston.transports.ConsoleTransportInstance[];

  private readonly _loggerWinston: winston.Logger;

  private readonly _logFormat: winston.Logform.Format;

  private readonly _logId = expressHttpContext.get('requestId');

  constructor(name: TLogFileNameType = 'server', dir = './logs', _level = 'info', maxSize = '10m', maxFiles = '30d') {
    this._logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.label({ label: name }),
      winston.format.splat(),
      winston.format.printf((info) => this.logFormat(info))
    );

    this._prodTransports = [
      new WinstonDaily({
        dirname: dir,
        filename: `${name}-application-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize,
        maxFiles,
      }),
      new WinstonDaily({
        dirname: dir,
        level: 'error',
        filename: `${name}-error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize,
        maxFiles,
      }),
    ];

    this._localTransports = [new winston.transports.Console({})];

    this._loggerWinston = winston.createLogger({
      format: this._logFormat,
      transports: config.isProduction ? this._prodTransports : this._localTransports,
    });
  }

  /**
   * Formats the log details into a string.
   * @param info - The log details to format.
   * @returns The formatted log details as a string.
   */
  private logFormat(info: winston.Logform.TransformableInfo): string {
    const { timestamp, label, level, msgId, message, parameters, error } = info;
    const parserError =
      error &&
      Object.getOwnPropertyNames(error).reduce<Record<string, unknown>>(
        (acc, key) => {
          acc[key] = (error as Record<string, unknown>)[key];

          return acc;
        },
        { name: error }
      );

    const logDetails = {
      logId: this._logId,
      timestamp,
      label,
      level,
      messageId: msgId,
      message,
      parameters,
      error: parserError,
    };

    return JSON.stringify(logDetails);
  }

  /**
   * Retrieves the message associated with the provided message ID.
   * @param msgId - The ID of the message to retrieve.
   * @returns The message associated with the provided ID, or an empty string if no message is found.
   */
  public getMessage(msgId: MsgIds): string {
    const [, message] = msgInfo.get(msgId) ?? [];

    return message ?? '';
  }

  /**
   * Logs a message with the provided message ID, error, and parameters.
   * @param msgId - The ID of the message to log.
   * @param error - The error to log, if any.
   * @param parameters - The parameters to log, if any.
   * @returns True if the message was logged successfully, false otherwise.
   */
  private logMessage(msgId: MsgIds, error?: Error | null, parameters?: any): boolean {
    const logData = msgInfo.get(msgId);

    if (!logData) {
      return false;
    }

    try {
      const [level, message] = logData;
      this._loggerWinston.log({
        logId: this._logId,
        level,
        msgId,
        message,
        parameters,
        error,
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Logs a message with the provided message ID and error.
   * @param msgId - The ID of the message to log.
   * @param error - The error to log.
   * @returns True if the message was logged successfully, false otherwise.
   */
  public writeWithError(msgId: MsgIds, error?: Error): boolean {
    return this.logMessage(msgId, error);
  }

  /**
   * Logs a message with the provided message ID, parameters, and error.
   * @param msgId - The ID of the message to log.
   * @param parameters - The parameters to log.
   * @param error - The error to log, if any.
   * @returns True if the message was logged successfully, false otherwise.
   */
  public writeWithParameter(msgId: MsgIds, parameters: any, error?: Error | null): boolean {
    return this.logMessage(msgId, error, parameters);
  }

  /**
   * Logs a message with the provided message ID.
   * @param msgId - The ID of the message to log.
   * @returns True if the message was logged successfully, false otherwise.
   */
  public write(msgId: MsgIds): boolean {
    return this.logMessage(msgId);
  }
}

export const logger = new WinstonLogger();

/**
 * Creates a new instance of the WinstonLogger class with the provided configurations or defaults.
 * @param name - The name of the log file.
 * @param dir - The directory to store the log files.
 * @param level - The level of the logs to write.
 * @param maxSize - The maximum size of the log files.
 * @param maxFiles - The maximum number of log files to keep.
 * @returns A new instance of the WinstonLogger class.
 */
export function createLogger(
  name: TLogFileNameType,
  dir?: string,
  level?: string,
  maxSize?: string,
  maxFiles?: string
) {
  return new WinstonLogger(name, dir, level, maxSize, maxFiles);
}
