import { Test, TestingModule } from '@nestjs/testing';
import { InOutHistoryController } from './inout-history.controller';
import { InOutHistoryService } from '../services/inout-history.service';
import { TestModuleBuilder } from '../../test-utils/test-module.builder';
import { InOutHistory } from '../entities/inout-history.entity';

describe('InOutHistoryController', () => {
  let controller: InOutHistoryController;
  let service: InOutHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .configureForController(InOutHistoryController, InOutHistoryService)
      .addMockRepository(InOutHistory)
      .build();

    controller = module.get<InOutHistoryController>(InOutHistoryController);
    service = module.get<InOutHistoryService>(InOutHistoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
