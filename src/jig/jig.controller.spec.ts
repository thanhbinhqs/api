import { Test, TestingModule } from '@nestjs/testing';
import { JigController } from './jig.controller';
import { JigService } from './jig.service';

describe('JigController', () => {
  let controller: JigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JigController],
      providers: [JigService],
    }).compile();

    controller = module.get<JigController>(JigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
