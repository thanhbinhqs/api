import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    console.log('exception', exception);
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()?.['message'] || exception.message
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      success: false,
      message: message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(process.env.NODE_ENV != 'production' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    });
  }
}
