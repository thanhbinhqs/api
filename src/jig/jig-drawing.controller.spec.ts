import { Test, TestingModule } from '@nestjs/testing';
import { JigDrawingController } from './jig-drawing.controller';
import { JigDrawingService } from './jig-drawing.service';

describe('JigDrawingController', () => {
  let controller: JigDrawingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JigDrawingController],
      providers: [
        {
          provide: JigDrawingService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByJigId: jest.fn(),
            approve: jest.fn(),
            reject: jest.fn(),
            getLatestVersion: jest.fn(),
            getVersionHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JigDrawingController>(JigDrawingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
