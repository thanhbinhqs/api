import { Test, TestingModule } from '@nestjs/testing';
import { InOutHistoryController } from './inout-history.controller';
import { InOutHistoryService } from '../services/inout-history.service';
import { CreateInOutHistoryDto } from '../dto/inout-history/create-inout-history.dto';
import { UpdateInOutHistoryDto } from '../dto/inout-history/update-inout-history.dto';
import { InOutHistoryFilterDto } from '../dto/inout-history/inout-history-filter.dto';
import { InOutHistory, InOutType } from '../entities/inout-history.entity';
import { PaginatedResult } from 'src/common';

describe('InOutHistoryController', () => {
  let controller: InOutHistoryController;
  let service: InOutHistoryService;

  const mockInOutHistoryService = {
    createInOutHistory: jest.fn(),
    findAllInOutHistories: jest.fn(),
    findInOutHistoryById: jest.fn(),
    updateInOutHistory: jest.fn(),
    deleteInOutHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InOutHistoryController],
      providers: [
        {
          provide: InOutHistoryService,
          useValue: mockInOutHistoryService,
        },
      ],
    }).compile();

    controller = module.get<InOutHistoryController>(InOutHistoryController);
    service = module.get<InOutHistoryService>(InOutHistoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an in-out history', async () => {
      const createInOutHistoryDto: CreateInOutHistoryDto = {
        type: InOutType.IN,
        quantity: 10,
        partDetailIds: ['part-detail-uuid'],
        description: 'Test history',
      };

      const mockInOutHistory = {
        id: 'test-uuid',
        ...createInOutHistoryDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as InOutHistory;

      mockInOutHistoryService.createInOutHistory.mockResolvedValue(mockInOutHistory);

      const result = await controller.create(createInOutHistoryDto);

      expect(result).toEqual(mockInOutHistory);
      expect(service.createInOutHistory).toHaveBeenCalledWith(createInOutHistoryDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated in-out histories', async () => {
      const filterDto: InOutHistoryFilterDto = {
        page: 1,
        limit: 10,
      };

      const mockResult: PaginatedResult<InOutHistory> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      mockInOutHistoryService.findAllInOutHistories.mockResolvedValue(mockResult);

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(mockResult);
      expect(service.findAllInOutHistories).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOne', () => {
    it('should return in-out history by ID', async () => {
      const id = 'test-uuid';
      const mockInOutHistory = {
        id,
        type: InOutType.IN,
        quantity: 10,
      } as unknown as InOutHistory;

      mockInOutHistoryService.findInOutHistoryById.mockResolvedValue(mockInOutHistory);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockInOutHistory);
      expect(service.findInOutHistoryById).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update in-out history', async () => {
      const id = 'test-uuid';
      const updateInOutHistoryDto: UpdateInOutHistoryDto = {
        type: InOutType.OUT,
        quantity: 5,
        description: 'Updated history',
      };

      const mockInOutHistory = {
        id,
        ...updateInOutHistoryDto,
      } as unknown as InOutHistory;

      mockInOutHistoryService.updateInOutHistory.mockResolvedValue(mockInOutHistory);

      const result = await controller.update(id, updateInOutHistoryDto);

      expect(result).toEqual(mockInOutHistory);
      expect(service.updateInOutHistory).toHaveBeenCalledWith(id, updateInOutHistoryDto);
    });
  });

  describe('remove', () => {
    it('should remove in-out history', async () => {
      const id = 'test-uuid';

      mockInOutHistoryService.deleteInOutHistory.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(result).toEqual({ message: 'In-out history đã được xóa thành công' });
      expect(service.deleteInOutHistory).toHaveBeenCalledWith(id);
    });
  });
});
