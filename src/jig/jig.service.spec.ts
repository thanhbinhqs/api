import { Test, TestingModule } from '@nestjs/testing';
import { JigService } from './jig.service';
import { TestModuleBuilder } from '../test-utils/test-module.builder';
import { Jig } from './entities/jig.entity';

describe('JigService', () => {
  let service: JigService;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .addService(JigService)
      .addMockRepository(Jig)
      .addMockRequest()
      .build();

    service = module.get<JigService>(JigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
