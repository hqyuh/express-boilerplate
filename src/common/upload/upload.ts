import fs from 'node:fs';
import path from 'node:path';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import BadRequestException from '@/common/exceptions/bad-request-exception';
import { logger, MsgIds } from '@/common/logger/logger';

const MAX_COUNT = 10;

export const uploadPath = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/**
 * Custom multer storage: pipe the incoming file stream straight to disk.
 * Avoids buffering the whole file in memory.
 */
const streamingStorage: multer.StorageEngine = {
  _handleFile(_req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadPath, filename);
    const writeStream = fs.createWriteStream(filepath);
    let size = 0;

    file.stream.on('data', (chunk: Buffer) => {
      size += chunk.length;
    });

    file.stream.pipe(writeStream);

    writeStream.on('error', (error) => {
      file.stream.destroy();
      fs.unlink(filepath, () => cb(error));
    });

    file.stream.on('error', (error) => {
      writeStream.destroy();
      fs.unlink(filepath, () => cb(error));
    });

    writeStream.on('finish', () => {
      cb(null, {
        destination: uploadPath,
        filename,
        path: filepath,
        size,
      });
    });
  },

  _removeFile(_req, file, cb) {
    fs.unlink(file.path, (error) => cb(error));
  },
};

const validateFile = (
  file: Express.Multer.File,
  fileType: 'image' | 'video' | 'file',
  cb: multer.FileFilterCallback
) => {
  let allowedTypes: RegExp;
  let errorCode = MsgIds.M0030011;

  switch (fileType) {
    case 'image': {
      allowedTypes = /jpeg|jpg|png|gif/;
      errorCode = MsgIds.M003007;
      break;
    }

    case 'video': {
      allowedTypes = /mp4|avi|mov|mkv|wmv/;
      errorCode = MsgIds.M003008;
      break;
    }

    case 'file': {
      allowedTypes = /pdf/;
      errorCode = MsgIds.M0030012;
      break;
    }

    default: {
      return cb(
        new BadRequestException({
          errorCode: 'UNKNOWN_FILE_TYPE',
          errorMessage: 'Unsupported file type.',
        })
      );
    }
  }

  const isExtnameValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isMimetypeValid = allowedTypes.test(file.mimetype);

  if (isExtnameValid && isMimetypeValid) {
    return cb(null, true);
  }

  cb(
    new BadRequestException({
      errorCode,
      errorMessage: logger.getMessage(errorCode),
    })
  );
};

/**
 * Middleware for handling streamed file uploads using multer.
 *
 * Incoming multipart file bytes are piped to disk via `createWriteStream`
 * (no full-file memory buffer). Limits:
 * - image: 5 MB
 * - video: 500 MB
 * - file (pdf): 10 MB
 */
export const uploadMiddleware =
  (typeFile: 'image' | 'video' | 'file', multiple = false) =>
  (req: Request, res: Response, next: NextFunction) => {
    let fileSize = 0;

    switch (typeFile) {
      case 'image': {
        fileSize = 5_000_000;
        break;
      }

      case 'video': {
        fileSize = 500_000_000;
        break;
      }

      case 'file': {
        fileSize = 10_000_000;
        break;
      }

      default: {
        break;
      }
    }

    const upload = multer({
      storage: streamingStorage,
      limits: { fileSize },
      fileFilter: (_request, file, cb) => validateFile(file, typeFile, cb),
    });

    const uploadHandler = multiple ? upload.array(typeFile, MAX_COUNT) : upload.single(typeFile);

    (uploadHandler as unknown as RequestHandler)(req, res, ((err: unknown) => {
      if (err instanceof BadRequestException) {
        return next(err);
      }

      if (err instanceof multer.MulterError) {
        let errorCode = MsgIds.M003009;
        let errorMessage = logger.getMessage(MsgIds.M003009);

        switch (err.code) {
          case 'LIMIT_FILE_SIZE': {
            errorCode = MsgIds.M0030010;
            errorMessage = logger.getMessage(MsgIds.M0030010);
            break;
          }

          case 'LIMIT_UNEXPECTED_FILE': {
            errorCode = MsgIds.M0030011;
            errorMessage = logger.getMessage(MsgIds.M0030011);
            break;
          }

          default: {
            break;
          }
        }

        return next(
          new BadRequestException({
            errorCode,
            errorMessage,
          })
        );
      }

      next();
    }) as NextFunction);
  };
