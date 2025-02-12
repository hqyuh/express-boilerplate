/* eslint-disable sonarjs/no-nested-switch */
/* eslint-disable max-len */
import fs from 'fs';
import path from 'path';

import BadRequestException from '@/common/exceptions/bad-request-exception';
import { MsgIds, logger } from '@/common/logger/logger';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

const MAX_COUNT = 10;

const uploadPath = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadPath);
  },
  filename(_req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const validateFile = (
  file: Express.Multer.File,
  fileType: 'image' | 'video' | 'file',
  cb: multer.FileFilterCallback
) => {
  let allowedTypes: RegExp;
  let isMimetypeValid: boolean;
  let errorCode = MsgIds.M0030011;

  switch (fileType) {
    case 'image': {
      allowedTypes = /jpeg|jpg|png|gif/;
      isMimetypeValid = file.mimetype.startsWith('image/');
      errorCode = MsgIds.M003007;
      break;
    }

    case 'video': {
      allowedTypes = /mp4|avi|mov|mkv|wmv/;
      isMimetypeValid = file.mimetype.startsWith('video/');
      errorCode = MsgIds.M003008;
      break;
    }

    case 'file': {
      allowedTypes = /pdf/;
      isMimetypeValid = file.mimetype === 'application/pdf';
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
  isMimetypeValid = allowedTypes.test(file.mimetype);

  if (isExtnameValid && isMimetypeValid) {
    return cb(null, true);
  }

  const error = new BadRequestException({
    errorCode,
    errorMessage: logger.getMessage(errorCode),
  });

  cb(error);
};

/**
 * Middleware for handling file uploads using multer.
 *
 * @param typeFile - The type of file to be uploaded. Can be 'image', 'video', or 'pdf'.
 * @param multiple - A boolean indicating whether multiple files should be uploaded. Defaults to false.
 * @returns A middleware function to handle the file upload.
 *
 * The middleware sets the maximum file size based on the type of file:
 * - 'image': 5 MB
 * - 'video': 500 MB
 * - 'pdf': 10 MB
 *
 * The middleware uses multer to handle the file upload and sets the storage, limits, and file filter options.
 * If `multiple` is true, it allows multiple files to be uploaded; otherwise, it allows only a single file.
 *
 * If an error occurs during the upload, the middleware handles specific multer errors:
 * - `LIMIT_FILE_SIZE`: File size exceeds the limit.
 * - `LIMIT_UNEXPECTED_FILE`: Unexpected file type.
 *
 * In case of an error, it passes a `BadRequestException` to the next middleware with an appropriate error code and message.
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
      storage,
      limits: { fileSize },
      fileFilter: (_request, file, cb) => validateFile(file, typeFile, cb),
    });

    const uploadHandler = multiple ? upload.array(typeFile, MAX_COUNT) : upload.single(typeFile);

    uploadHandler(req, res, (err: unknown) => {
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
    });
  };
