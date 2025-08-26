import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JigDrawingService } from './jig-drawing.service';
import { JigDrawing } from './entities/jig-drawing.entity';
import { JigService } from './jig.service';

describe('JigDrawingService', () => {
  let service: JigDrawingService;
  let repository: Repository<JigDrawing>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JigDrawingService,
        {
          provide: getRepositoryToken(JigDrawing),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              addOrderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn(),
              getOne: jest.fn(),
              getMany: jest.fn(),
            })),
          },
        },
        {
          provide: JigService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JigDrawingService>(JigDrawingService);
    repository = module.get<Repository<JigDrawing>>(
      getRepositoryToken(JigDrawing),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
