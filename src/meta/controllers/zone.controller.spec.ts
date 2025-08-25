import { Test, TestingModule } from '@nestjs/testing';
import { ZoneController } from './zone.controller';
import { ZoneService } from '../services/zone.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Zone } from '../entities/zone.entity';
import { Repository } from 'typeorm';

describe('ZoneController', () => {
  let controller: ZoneController;
  let service: ZoneService;

  const mockZoneRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getOne: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZoneController],
      providers: [
        ZoneService,
        {
          provide: getRepositoryToken(Zone),
          useValue: mockZoneRepository,
        },
      ],
    }).compile();

    controller = module.get<ZoneController>(ZoneController);
    service = module.get<ZoneService>(ZoneService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a zone', async () => {
      const createZoneDto = {
        name: 'Test Zone',
        slug: 'test-zone',
        description: 'Test Description',
        code: 'TZ001',
      };

      const mockZone = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createZoneDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockZoneRepository.createQueryBuilder().getOne.mockResolvedValue(null);
      mockZoneRepository.create.mockReturnValue(mockZone);
      mockZoneRepository.save.mockResolvedValue(mockZone);

      const result = await controller.create(createZoneDto);

      expect(result).toEqual(mockZone);
      expect(mockZoneRepository.create).toHaveBeenCalledWith(createZoneDto);
      expect(mockZoneRepository.save).toHaveBeenCalledWith(mockZone);
    });
  });
});
