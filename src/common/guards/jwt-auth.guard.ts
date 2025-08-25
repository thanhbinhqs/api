import { Injectable, ExecutionContext, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { SystemSettingKey } from '../constants/system-settings.constants';
import { ALLOW_ANONYMOUS_KEY } from '../decorators/allow-anonymous.decorator';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    try {
      // First try to authenticate with JWT
      //await super.canActivate(context);
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromHeader(request);

      if (!token) return false;

      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: request.secret,
        });
        const user = await this.userRepository.findOne({
          where: {
            id: payload.sub,
            isDeleted: false,
            isActive: true,
          },
          relations: ['roles'],
        }); // Find user by ID from payload
        if (!user) return false; // If user not found, token is invalid
        if (user.tokenVersion !== payload.tokenVersion) return false; // If token version does not match, token is invalid
        request.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles || [],
          permissions: user.permissions || [],
          tokenVersion: user.tokenVersion,
        };

        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    } catch (e) {
      // If JWT auth fails, check for anonymous access
      const isAnonymousAllowed = this.reflector.getAllAndOverride<boolean>(
        ALLOW_ANONYMOUS_KEY,
        [context.getHandler(), context.getClass()],
      );
      return isAnonymousAllowed;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
  // handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
  //   const request = context.switchToHttp().getRequest<Request>();

  //   if (!user) {
  //     const jwtAlgorithm =
  //       request.systemSettings?.[SystemSettingKey.SECURITY_JWT_ALGORITHM] ||
  //       'HS256';

  //     // Verify token with correct algorithm from settings
  //     try {
  //       const token = request.headers.authorization?.split(' ')[1];
  //       if (token) {
  //         this.jwtService.verify(token, {
  //           algorithms: [jwtAlgorithm],
  //         });
  //       }
  //     } catch (err) {
  //       throw new Error('Invalid token');
  //     }

  //     request.user = {
  //       id: user.id,
  //       username: user.username,
  //       email: user.email,
  //       roles: user.roles || [],
  //       permissions: user.permissions || [],
  //       tokenVersion: user.tokenVersion,
  //     };
  //   }

  //   return super.handleRequest(err, user, info, context);
  // }
}
