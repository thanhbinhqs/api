import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from '../services/location.service';
import { CreateLocationDto } from '../dto/location/create-location.dto';
import { UpdateLocationDto } from '../dto/location/update-location.dto';
import { LocationFilterDto } from '../dto/location/location-filter.dto';
import { Location } from '../entities/location.entity';
import { PaginatedResult } from 'src/common';
import { NotFoundException } from '@nestjs/common';

describe('LocationController', () => {
  let controller: LocationController;
  let service: LocationService;

  const mockLocationService = {
    createLocation: jest.fn(),
    findAllLocations: jest.fn(),
    findAllLocationsSimple: jest.fn(),
    findLocationsByName: jest.fn(),
    findLocationById: jest.fn(),
    updateLocation: jest.fn(),
    deleteLocation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a location', async () => {
      const createLocationDto: CreateLocationDto = {
        name: 'Test Location',
        code: 'TL001',
        description: 'Test Description',
      };

      const mockLocation = {
        id: 'test-uuid',
        ...createLocationDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Location;

      mockLocationService.createLocation.mockResolvedValue(mockLocation);

      const result = await controller.create(createLocationDto);

      expect(result).toEqual(mockLocation);
      expect(service.createLocation).toHaveBeenCalledWith(createLocationDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated locations', async () => {
      const filterDto: LocationFilterDto = {
        page: 1,
        limit: 10,
      };

      const mockResult: PaginatedResult<Location> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      mockLocationService.findAllLocations.mockResolvedValue(mockResult);

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(mockResult);
      expect(service.findAllLocations).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findAllSimple', () => {
    it('should return simple locations list', async () => {
      const mockLocations: Location[] = [
        { id: 'uuid1', name: 'Location 1' } as unknown as Location,
        { id: 'uuid2', name: 'Location 2' } as unknown as Location,
      ];

      mockLocationService.findAllLocationsSimple.mockResolvedValue(mockLocations);

      const result = await controller.findAllSimple();

      expect(result).toEqual(mockLocations);
      expect(service.findAllLocationsSimple).toHaveBeenCalled();
    });
  });

  describe('findByName', () => {
    it('should return locations by name', async () => {
      const name = 'Test Location';
      const mockLocations: Location[] = [
        { id: 'uuid1', name: 'Test Location 1' } as unknown as Location,
      ];

      mockLocationService.findLocationsByName.mockResolvedValue(mockLocations);

      const result = await controller.findByName(name);

      expect(result).toEqual(mockLocations);
      expect(service.findLocationsByName).toHaveBeenCalledWith(name);
    });
  });

  describe('findOne', () => {
    it('should return location by ID', async () => {
      const id = 'test-uuid';
      const mockLocation = {
        id,
        name: 'Test Location',
      } as unknown as Location;

      mockLocationService.findLocationById.mockResolvedValue(mockLocation);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockLocation);
      expect(service.findLocationById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when location not found by ID', async () => {
      const id = 'non-existent-uuid';

      mockLocationService.findLocationById.mockResolvedValue(null);

      await expect(controller.findOne(id)).rejects.toThrow(
        new NotFoundException(`Location với ID "${id}" không tồn tại`)
      );
    });
  });

  describe('update', () => {
    it('should update location', async () => {
      const id = 'test-uuid';
      const updateLocationDto: UpdateLocationDto = {
        name: 'Updated Location',
        description: 'Updated Description',
      };

      const mockLocation = {
        id,
        ...updateLocationDto,
      } as unknown as Location;

      mockLocationService.updateLocation.mockResolvedValue(mockLocation);

      const result = await controller.update(id, updateLocationDto);

      expect(result).toEqual(mockLocation);
      expect(service.updateLocation).toHaveBeenCalledWith(id, updateLocationDto);
    });
  });

  describe('remove', () => {
    it('should remove location', async () => {
      const id = 'test-uuid';

      mockLocationService.deleteLocation.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(result).toEqual({ message: 'Location đã được xóa thành công' });
      expect(service.deleteLocation).toHaveBeenCalledWith(id);
    });
  });
});
