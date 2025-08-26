import { Test, TestingModule } from '@nestjs/testing';
import { PartService } from './part.service';
import { TestModuleBuilder } from '../test-utils/test-module.builder';
import { Part } from './entities/part.entity';

describe('PartService', () => {
  let service: PartService;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .addService(PartService)
      .addMockRepository(Part)
      .addMockRequest()
      .build();

    service = module.get<PartService>(PartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
