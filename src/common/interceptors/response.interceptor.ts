import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode;
        const responseData = {
          statusCode,
          success: true,
          data: data || null,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        const clientIp = request.headers['x-forwarded-for'] || request.ip;
        const method = request.method;

        this.logger.log(`${method} ${request.url} ${statusCode} - ${clientIp}`);
        return responseData;
      }),
    );
  }
}
