import { Test, TestingModule } from '@nestjs/testing';
import { PartDetailController } from './part-detail.controller';
import { PartDetailService } from './part-detail.service';
import { CreatePartDetailDto } from './dto/create-part-detail.dto';
import { UpdatePartDetailDto } from './dto/update-part-detail.dto';
import { PartDetailFilterDto } from './dto/part-detail-filter.dto';
import { BatchUpdateStatusDto } from './dto/batch-update-status.dto';
import { PartDetailStatus } from './entities/part-detail.entity';

describe('PartDetailController', () => {
  let controller: PartDetailController;
  let service: PartDetailService;

  const mockPartDetailService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findBySerialNumber: jest.fn(),
    findByPartId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatusBatch: jest.fn(),
    remove: jest.fn(),
    findByJigDetail: jest.fn(),
    updateJigDetail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartDetailController],
      providers: [
        {
          provide: PartDetailService,
          useValue: mockPartDetailService,
        },
      ],
    }).compile();

    controller = module.get<PartDetailController>(PartDetailController);
    service = module.get<PartDetailService>(PartDetailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a part detail', async () => {
      const createPartDetailDto: CreatePartDetailDto = {
        serialNumber: 'SN001',
        partId: 'part-uuid',
      };

      const mockPartDetail = {
        id: 'test-uuid',
        ...createPartDetailDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPartDetailService.create.mockResolvedValue(mockPartDetail);

      const result = await controller.create(createPartDetailDto);

      expect(result).toEqual(mockPartDetail);
      expect(service.create).toHaveBeenCalledWith(createPartDetailDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated part details', async () => {
      const filterDto: PartDetailFilterDto = {
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      mockPartDetailService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findBySerialNumber', () => {
    it('should return part detail by serial number', async () => {
      const serialNumber = 'SN001';
      const mockPartDetail = {
        id: 'test-uuid',
        serialNumber,
      };

      mockPartDetailService.findBySerialNumber.mockResolvedValue(mockPartDetail);

      const result = await controller.findBySerialNumber(serialNumber);

      expect(result).toEqual(mockPartDetail);
      expect(service.findBySerialNumber).toHaveBeenCalledWith(serialNumber);
    });
  });

  describe('findByPartId', () => {
    it('should return part details by part ID', async () => {
      const partId = 'part-uuid';
      const mockPartDetails = [
        { id: 'test-uuid-1', serialNumber: 'SN001' },
        { id: 'test-uuid-2', serialNumber: 'SN002' },
      ];

      mockPartDetailService.findByPartId.mockResolvedValue(mockPartDetails);

      const result = await controller.findByPartId(partId);

      expect(result).toEqual(mockPartDetails);
      expect(service.findByPartId).toHaveBeenCalledWith(partId);
    });
  });

  describe('findOne', () => {
    it('should return part detail by ID', async () => {
      const id = 'test-uuid';
      const mockPartDetail = {
        id,
        serialNumber: 'SN001',
      };

      mockPartDetailService.findOne.mockResolvedValue(mockPartDetail);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockPartDetail);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update part detail', async () => {
      const id = 'test-uuid';
      const updatePartDetailDto: UpdatePartDetailDto = {
        serialNumber: 'SN001-UPDATED',
        version: '1',
      };

      const mockPartDetail = {
        id,
        ...updatePartDetailDto,
      };

      mockPartDetailService.update.mockResolvedValue(mockPartDetail);

      const result = await controller.update(id, updatePartDetailDto);

      expect(result).toEqual(mockPartDetail);
      expect(service.update).toHaveBeenCalledWith(id, updatePartDetailDto);
    });
  });

  describe('updateStatusBatch', () => {
    it('should update status batch', async () => {
      const batchUpdateDto: BatchUpdateStatusDto = {
        partDetailIds: ['uuid1', 'uuid2'],
        newStatus: PartDetailStatus.IN_USE,
        versions: ['version1', 'version2'],
      };

      const mockResult = {
        updated: ['uuid1', 'uuid2'],
        errors: [],
      };

      mockPartDetailService.updateStatusBatch.mockResolvedValue(mockResult);

      const result = await controller.updateStatusBatch(batchUpdateDto);

      expect(result).toEqual(mockResult);
      expect(service.updateStatusBatch).toHaveBeenCalledWith(
        batchUpdateDto.partDetailIds,
        batchUpdateDto.newStatus,
        batchUpdateDto.versions
      );
    });
  });

  describe('remove', () => {
    it('should remove part detail', async () => {
      const id = 'test-uuid';

      mockPartDetailService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(result).toEqual(undefined);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('findByJigDetail', () => {
    it('should return part details by jig detail ID', async () => {
      const jigDetailId = 'jig-detail-uuid';
      const mockPartDetails = [
        { id: 'test-uuid-1', serialNumber: 'SN001' },
        { id: 'test-uuid-2', serialNumber: 'SN002' },
      ];

      mockPartDetailService.findByJigDetail.mockResolvedValue(mockPartDetails);

      const result = await controller.findByJigDetail(jigDetailId);

      expect(result).toEqual(mockPartDetails);
      expect(service.findByJigDetail).toHaveBeenCalledWith(jigDetailId);
    });
  });

  describe('updateJigDetail', () => {
    it('should update jig detail for part detail', async () => {
      const id = 'test-uuid';
      const jigDetailId = 'jig-detail-uuid';

      const mockPartDetail = {
        id,
        jigDetailId,
        serialNumber: 'SN001',
      };

      mockPartDetailService.updateJigDetail.mockResolvedValue(mockPartDetail);

      const result = await controller.updateJigDetail(id, jigDetailId);

      expect(result).toEqual(mockPartDetail);
      expect(service.updateJigDetail).toHaveBeenCalledWith(id, jigDetailId);
    });

    it('should update jig detail to null', async () => {
      const id = 'test-uuid';
      const jigDetailId = null;

      const mockPartDetail = {
        id,
        jigDetailId: null,
        serialNumber: 'SN001',
      };

      mockPartDetailService.updateJigDetail.mockResolvedValue(mockPartDetail);

      const result = await controller.updateJigDetail(id, jigDetailId);

      expect(result).toEqual(mockPartDetail);
      expect(service.updateJigDetail).toHaveBeenCalledWith(id, jigDetailId);
    });
  });
});
