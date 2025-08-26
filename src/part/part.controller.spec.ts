import { Test, TestingModule } from '@nestjs/testing';
import { PartController } from './part.controller';
import { PartService } from './part.service';
import { TestModuleBuilder } from '../test-utils/test-module.builder';
import { Part } from './entities/part.entity';

describe('PartController', () => {
  let controller: PartController;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .configureForController(PartController, PartService)
      .addMockRepository(Part)
      .build();

    controller = module.get<PartController>(PartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
