import { Test, TestingModule } from '@nestjs/testing';
import { JigService } from './jig.service';

describe('JigService', () => {
  let service: JigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JigService],
    }).compile();

    service = module.get<JigService>(JigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
