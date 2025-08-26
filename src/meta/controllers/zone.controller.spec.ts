import { Test, TestingModule } from '@nestjs/testing';
import { ZoneController } from './zone.controller';
import { ZoneService } from '../services/zone.service';
import { Zone } from '../entities/zone.entity';
import { TestModuleBuilder } from '../../test-utils/test-module.builder';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ZoneController', () => {
  let controller: ZoneController;
  let service: ZoneService;
  let zoneRepository: Repository<Zone>;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .configureForController(ZoneController, ZoneService)
      .addMockRepository(Zone)
      .build();

    controller = module.get<ZoneController>(ZoneController);
    service = module.get<ZoneService>(ZoneService);
    zoneRepository = module.get<Repository<Zone>>(getRepositoryToken(Zone));
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

      // Mock repository methods properly
      const queryBuilder = zoneRepository.createQueryBuilder();
      jest.spyOn(queryBuilder, 'getOne').mockResolvedValue(null);
      jest.spyOn(zoneRepository, 'create').mockReturnValue(mockZone as any);
      jest.spyOn(zoneRepository, 'save').mockResolvedValue(mockZone as any);

      const result = await controller.create(createZoneDto);

      expect(result).toEqual(mockZone);
      expect(zoneRepository.create).toHaveBeenCalledWith(createZoneDto);
      expect(zoneRepository.save).toHaveBeenCalledWith(mockZone);
    });
  });
});
