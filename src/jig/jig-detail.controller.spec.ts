import { Test, TestingModule } from '@nestjs/testing';
import { JigDetailController } from './jig-detail.controller';
import { JigDetailService } from './jig-detail.service';
import { TestModuleBuilder } from '../test-utils/test-module.builder';
import { JigDetail } from './entities/jig-detail.entity';

describe('JigDetailController', () => {
  let controller: JigDetailController;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .configureForController(JigDetailController, JigDetailService)
      .addMockRepository(JigDetail)
      .build();

    controller = module.get<JigDetailController>(JigDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});