import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    //console.log('exception', exception);
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()?.['message'] || exception.message
        : 'Internal server error';

    const clientIp = request.headers['x-forwarded-for'] || request.ip;
    const method = request.method;
    const statusCode = response.statusCode;

    this.logger.log(`${method} ${request.url} ${statusCode} - ${clientIp}`);

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
