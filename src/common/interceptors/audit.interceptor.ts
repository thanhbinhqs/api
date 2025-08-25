import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (user && request.body) {
      const method = request.method;
      const now = new Date();
      
      if (method === 'POST') {
        request.body.createdBy = user.id;
        request.body.createdAt = now;
      } else if (method === 'PATCH' || method === 'PUT') {
        request.body.updatedBy = user.id;
        request.body.updatedAt = now;
      }
    }

    return next.handle().pipe(
      tap(() => {
        // Log thao tác nếu cần
        console.log(`User ${user?.id} performed ${request.method} on ${request.url}`);
      })
    );
  }
}
