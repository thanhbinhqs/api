import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from '../request-context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    RequestContextService.run(
      {
        req: {
          ip: req.ip,
          headers: {
            'user-agent': req.headers['user-agent'],
          },
        },
      },
      () => {
        next();
      },
    );
  }
}
