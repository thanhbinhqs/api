import { Test, TestingModule } from '@nestjs/testing';
import { PartDetailController } from './part-detail.controller';
import { PartDetailService } from './part-detail.service';
import { TestModuleBuilder } from '../test-utils/test-module.builder';
import { PartDetail } from './entities/part-detail.entity';
import { Part } from './entities/part.entity';

describe('PartDetailController', () => {
  let controller: PartDetailController;
  let service: PartDetailService;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .configureForController(PartDetailController, PartDetailService)
      .addMockRepository(PartDetail)
      .addMockRepository(Part)
      .build();

    controller = module.get<PartDetailController>(PartDetailController);
    service = module.get<PartDetailService>(PartDetailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
