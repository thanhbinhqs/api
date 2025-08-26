import { Test, TestingModule } from '@nestjs/testing';
import { JigDrawingController } from './jig-drawing.controller';
import { JigDrawingService } from './jig-drawing.service';
import { TestModuleBuilder } from '../test-utils/test-module.builder';
import { JigDrawing } from './entities/jig-drawing.entity';
import { JigService } from './jig.service';
import { Jig } from './entities/jig.entity';

describe('JigDrawingController', () => {
  let controller: JigDrawingController;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .configureForController(JigDrawingController, JigDrawingService)
      .addMockRepository(JigDrawing)
      .addMockRepository(Jig)
      .addService(JigService)
      .build();

    controller = module.get<JigDrawingController>(JigDrawingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
