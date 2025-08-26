import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { REQUEST } from '@nestjs/core';
import { Repository } from 'typeorm';

// Import các services cần thiết để mock
import { RequestContext } from '../common/request-context';
import { NotificationService } from '../notification/notification.service';
import { NotificationEventService } from '../common/services/notification-event.service';
import { EncryptionService } from '../common/services/encryption.service';
import { User } from '../user/entities/user.entity';

// Mock repository factory
export const createMockRepository = (): any => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    rightJoin: jest.fn().mockReturnThis(),
    rightJoinAndSelect: jest.fn().mockReturnThis(),
    distinct: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
    getRawMany: jest.fn().mockResolvedValue([]),
    getRawOne: jest.fn().mockResolvedValue(null),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    getCount: jest.fn().mockResolvedValue(0),
    getRawAndEntities: jest.fn().mockResolvedValue({ entities: [], raw: [] }),
    clone: jest.fn().mockReturnThis(),
  })),
});

// Mock JWT service
export const createMockJwtService = (): Partial<JwtService> => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@example.com' }),
  decode: jest.fn(),
});

// Mock request object
export const createMockRequest = () => ({
  user: {
    id: 'mock-user-id',
    username: 'testuser',
    email: 'test@example.com',
    roles: [{ name: 'admin', permissions: [] }],
  },
  systemSettings: {
    'auth.maxLoginAttempts': '5',
    'auth.lockoutDuration': '30',
    'security.jwtExpiry': '8',
    'security.jwtAlgorithm': 'HS256',
  },
  headers: {},
  body: {},
  query: {},
  params: {},
});

// Mock Reflector
export const createMockReflector = (): Partial<Reflector> => ({
  get: jest.fn(),
  getAll: jest.fn(),
  getAllAndMerge: jest.fn(),
  getAllAndOverride: jest.fn(),
});

// Test module builder utility
export class TestModuleBuilder {
  private providers: any[] = [];
  private controllers: any[] = [];

  addController(controller: any): TestModuleBuilder {
    this.controllers.push(controller);
    return this;
  }

  addService(service: any): TestModuleBuilder {
    this.providers.push(service);
    return this;
  }

  addMockRepository(entity: any): TestModuleBuilder {
    const token = getRepositoryToken(entity);
    this.providers.push({
      provide: token,
      useValue: createMockRepository(),
    });
    return this;
  }

  addMockJwtService(): TestModuleBuilder {
    this.providers.push({
      provide: JwtService,
      useValue: createMockJwtService(),
    });
    return this;
  }

  addMockReflector(): TestModuleBuilder {
    this.providers.push({
      provide: Reflector,
      useValue: createMockReflector(),
    });
    return this;
  }

  addMockRequest(): TestModuleBuilder {
    this.providers.push({
      provide: REQUEST,
      useValue: createMockRequest(),
    });
    return this;
  }

  addMockNotificationEventService(): TestModuleBuilder {
    this.providers.push({
      provide: NotificationEventService,
      useValue: {
        emitUserCreated: jest.fn(),
        emitUserUpdated: jest.fn(),
        emitUserDeleted: jest.fn(),
        emit: jest.fn(),
      },
    });
    return this;
  }

  addMockEncryptionService(): TestModuleBuilder {
    this.providers.push({
      provide: EncryptionService,
      useValue: {
        encryptPassword: jest.fn(),
        comparePassword: jest.fn(),
        generateSalt: jest.fn(),
        hash: jest.fn(),
      },
    });
    return this;
  }

  addProvider(provider: any): TestModuleBuilder {
    this.providers.push(provider);
    return this;
  }

  // Preset cho Controllers (bao gồm các mock cần thiết cho JwtAuthGuard)
  configureForController(controller: any, service?: any): TestModuleBuilder {
    this.addController(controller);
    
    if (service) {
      this.addService(service);
    }

    // Thêm các mock cần thiết cho JwtAuthGuard và authentication
    this.addMockJwtService()
        .addMockReflector()
        .addMockRequest();

    // Thêm UserRepository mock cho JwtAuthGuard
    this.addProvider({
      provide: getRepositoryToken(User),
      useValue: createMockRepository(),
    });

    return this;
  }

  // Preset cho Services 
  configureForService(service: any, repositories: any[] = []): TestModuleBuilder {
    this.addService(service);
    this.addMockRequest();
    this.addMockNotificationEventService();
    this.addMockEncryptionService();
    
    // Thêm mock repositories
    repositories.forEach(entity => {
      this.addMockRepository(entity);
    });

    return this;
  }

  async build(): Promise<TestingModule> {
    const moduleConfig: any = {
      providers: [...this.providers],
    };

    if (this.controllers.length > 0) {
      moduleConfig.controllers = [...this.controllers];
    }

    return await Test.createTestingModule(moduleConfig).compile();
  }
}
