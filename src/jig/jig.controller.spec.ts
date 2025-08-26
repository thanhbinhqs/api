import { Test, TestingModule } from '@nestjs/testing';
import { JigController } from './jig.controller';
import { JigService } from './jig.service';
import { TestModuleBuilder } from '../test-utils/test-module.builder';
import { Jig } from './entities/jig.entity';

describe('JigController', () => {
  let controller: JigController;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .configureForController(JigController, JigService)
      .addMockRepository(Jig)
      .build();

    controller = module.get<JigController>(JigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
