import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import type { Request } from 'express';
import { SystemSettingKey } from '../common/constants/system-settings.constants';
import { Utils } from 'src/common/services/utils';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from 'src/common/dto/user-response.dto';
import moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({
      where: {
        username: ILike(username),
        isDeleted: false,
      },
      relations: ['roles'],
    });

    if (!user) throw new BadRequestException('Username is not found');

    // Check login attempts
    const maxAttempts =
      this.request.systemSettings[SystemSettingKey.AUTH_MAX_LOGIN_ATTEMPTS] ||
      5;
    const lockoutDuration =
      this.request.systemSettings[SystemSettingKey.AUTH_LOCKOUT_DURATION] || 30;

    if (user.failedLoginAttempts >= maxAttempts && user.lastFailedLogin) {
      const lastAttempt = new Date(user.lastFailedLogin);
      const unlockTime = new Date(
        lastAttempt.getTime() + lockoutDuration * 60 * 1000,
      );

      if (new Date() < unlockTime) {
        throw new BadRequestException(
          `Account locked. Try again after ${unlockTime}`,
        );
      } else {
        // Reset attempts if lockout period has passed
        user.failedLoginAttempts = 0;
        await this.userRepository.save(user);
      }
    }

    if (!(await bcrypt.compare(password, user.password))) {
      user.failedLoginAttempts += 1;
      user.lastFailedLogin = new Date();
      await this.userRepository.save(user);
      throw new BadRequestException('Invalid Password');
    }

    if (!user.isActive) throw new BadRequestException('Account is not active');

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    await this.userRepository.save(user);

    const payload = {
      sub: user.id,
      username: user.username,
      tokenVersion: user.tokenVersion,
    };
    const jwtExpiry =
      this.request.systemSettings[SystemSettingKey.SECURITY_JWT_EXPIRY] || '8';
    const algorithm =
      this.request.systemSettings[SystemSettingKey.SECURITY_JWT_ALGORITHM] ||
      'HS256';
      

    return {
      token: this.jwtService.sign(payload, {
        expiresIn: `${jwtExpiry}h`,
        secret: process.env.JWT_SECRET,
        algorithm: algorithm,
      }),
      expireAt: moment().add(jwtExpiry, 'hours').toDate(),
      user: new UserResponseDto(user),
    };
  }

  async register(createUserDto: RegisterDto) {
    let user = await this.userRepository.findOne({
      where: { username: ILike(createUserDto.username) },
    });

    if (user)
      throw new BadRequestException(
        'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác',
      );

    const password = Utils.hashedPassword(createUserDto.password);

    user = this.userRepository.create({
      username: createUserDto.username.trim().toLocaleLowerCase(),
      password,
      isActive: false,
      roles: [],
      permissions: [],
      createdBy: 'system',
    });

    user = await this.userRepository.save(user);

    return new UserResponseDto(user);
  }
}
