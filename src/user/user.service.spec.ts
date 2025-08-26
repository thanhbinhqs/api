import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { TestModuleBuilder } from '../test-utils/test-module.builder';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { EncryptionService } from '../common/services/encryption.service';
import { NotificationService } from '../notification/notification.service';

// Mock NotificationService
const mockNotificationService = {
  sendToUser: jest.fn(),
  sendToRole: jest.fn(),
  sendToAll: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .addService(UserService)
      .addMockRepository(User)
      .addMockRepository(Role)
      .addMockRequest()
      .addMockNotificationEventService()
      .addProvider({
        provide: EncryptionService,
        useValue: {
          encrypt: jest.fn(),
          decrypt: jest.fn(),
        },
      })
      .addProvider({
        provide: NotificationService,
        useValue: mockNotificationService,
      })
      .build();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
