import EHttpStatusCode from '@/common/constants/http-status-code';

interface ISuccessResponsePayload<T> {
  metadata: T;
  status?: number;
  message?: string;
}

export class SuccessResponse<T> {
  public metadata: T;

  public status: number;

  public messages: string;

  // eslint-disable-next-line max-len
  constructor({ metadata, status = EHttpStatusCode.OK, message = 'ok' }: ISuccessResponsePayload<T>) {
    this.messages = message;
    this.status = status;
    this.metadata = metadata;
  }
}
