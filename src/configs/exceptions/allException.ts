import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';

import CustomLogger from '@microservice-user/module-log/customLogger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private logger: CustomLogger,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : (exception as any)?.message;
    const stack = (exception as any)?.stack;
    const errorName = (exception as any)?.name;

    this.logger.error(message, stack, errorName);

    if (exception instanceof RpcException) {
      return Promise.reject(exception);
    }

    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: {
        error: message,
        errorName,
      },
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
