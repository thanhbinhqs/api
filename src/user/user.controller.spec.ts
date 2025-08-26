import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TestModuleBuilder } from '../test-utils/test-module.builder';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .configureForController(UserController, UserService)
      .addMockRepository(User)
      .addMockRepository(Role)
      .addMockEncryptionService()
      .addMockNotificationEventService()
      .build();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
