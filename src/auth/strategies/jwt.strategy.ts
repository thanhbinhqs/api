import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: {
        id: payload.sub,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return null;
    }

    // Get permissions from roles
    const rolePermissions =
      user.roles?.flatMap((role) => role.permissions || []) || [];

    return {
      ...user,
      username: user.username, // Ensure username is included
      roles:
        user.roles.map((r) => {
          return { ...r, permissions: [] };
        }) || [],
      permissions: [...new Set(rolePermissions)], // Remove duplicates
    };
  }
}
