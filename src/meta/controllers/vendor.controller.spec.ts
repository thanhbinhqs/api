import { Test, TestingModule } from '@nestjs/testing';
import { VendorController } from './vendor.controller';
import { VendorService } from '../services/vendor.service';
import { CreateVendorDto } from '../dto/vendor/create-vendor.dto';
import { UpdateVendorDto } from '../dto/vendor/update-vendor.dto';
import { VendorFilterDto } from '../dto/vendor/vendor-filter.dto';
import { Vendor } from '../entities/vendor.entity';
import { PaginatedResult } from 'src/common';
import { NotFoundException } from '@nestjs/common';

describe('VendorController', () => {
  let controller: VendorController;
  let service: VendorService;

  const mockVendorService = {
    createVendor: jest.fn(),
    findAllVendors: jest.fn(),
    findAllVendorsSimple: jest.fn(),
    findVendorById: jest.fn(),
    updateVendor: jest.fn(),
    deleteVendor: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorController],
      providers: [
        {
          provide: VendorService,
          useValue: mockVendorService,
        },
      ],
    }).compile();

    controller = module.get<VendorController>(VendorController);
    service = module.get<VendorService>(VendorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a vendor', async () => {
      const createVendorDto: CreateVendorDto = {
        name: 'Test Vendor',
        code: 'TV001',
        description: 'Test Description',
      };

      const mockVendor = {
        id: 'test-uuid',
        ...createVendorDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Vendor;

      mockVendorService.createVendor.mockResolvedValue(mockVendor);

      const result = await controller.create(createVendorDto);

      expect(result).toEqual(mockVendor);
      expect(service.createVendor).toHaveBeenCalledWith(createVendorDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated vendors', async () => {
      const filterDto: VendorFilterDto = {
        page: 1,
        limit: 10,
      };

      const mockResult: PaginatedResult<Vendor> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      mockVendorService.findAllVendors.mockResolvedValue(mockResult);

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(mockResult);
      expect(service.findAllVendors).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findAllSimple', () => {
    it('should return simple vendors list', async () => {
      const mockVendors: Vendor[] = [
        { id: 'uuid1', name: 'Vendor 1' } as unknown as Vendor,
        { id: 'uuid2', name: 'Vendor 2' } as unknown as Vendor,
      ];

      mockVendorService.findAllVendorsSimple.mockResolvedValue(mockVendors);

      const result = await controller.findAllSimple();

      expect(result).toEqual(mockVendors);
      expect(service.findAllVendorsSimple).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return vendor by ID', async () => {
      const id = 'test-uuid';
      const mockVendor = {
        id,
        name: 'Test Vendor',
      } as unknown as Vendor;

      mockVendorService.findVendorById.mockResolvedValue(mockVendor);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockVendor);
      expect(service.findVendorById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when vendor not found by ID', async () => {
      const id = 'non-existent-uuid';

      mockVendorService.findVendorById.mockResolvedValue(null);

      await expect(controller.findOne(id)).rejects.toThrow(
        new NotFoundException(`Vendor với ID "${id}" không tồn tại`)
      );
    });
  });

  describe('update', () => {
    it('should update vendor', async () => {
      const id = 'test-uuid';
      const updateVendorDto: UpdateVendorDto = {
        name: 'Updated Vendor',
        description: 'Updated Description',
      };

      const mockVendor = {
        id,
        ...updateVendorDto,
      } as unknown as Vendor;

      mockVendorService.updateVendor.mockResolvedValue(mockVendor);

      const result = await controller.update(id, updateVendorDto);

      expect(result).toEqual(mockVendor);
      expect(service.updateVendor).toHaveBeenCalledWith(id, updateVendorDto);
    });
  });

  describe('remove', () => {
    it('should remove vendor', async () => {
      const id = 'test-uuid';

      mockVendorService.deleteVendor.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(result).toEqual({ message: 'Vendor đã được xóa thành công' });
      expect(service.deleteVendor).toHaveBeenCalledWith(id);
    });
  });
});
