import { Test, TestingModule } from '@nestjs/testing';
import { ProcessController } from './process.controller';
import { ProcessService } from '../services/process.service';
import { TestModuleBuilder } from '../../test-utils/test-module.builder';
import { Process } from '../entities/process.entity';

describe('ProcessController', () => {
  let controller: ProcessController;
  let service: ProcessService;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .configureForController(ProcessController, ProcessService)
      .addMockRepository(Process)
      .build();

    controller = module.get<ProcessController>(ProcessController);
    service = module.get<ProcessService>(ProcessService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
