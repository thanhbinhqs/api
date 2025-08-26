import { Test, TestingModule } from '@nestjs/testing';
import { LineController } from './line.controller';
import { LineService } from '../services/line.service';
import { CreateLineDto } from '../dto/line/create-line.dto';
import { UpdateLineDto } from '../dto/line/update-line.dto';
import { LineFilterDto } from '../dto/line/line-filter.dto';
import { Line } from '../entities/line.entity';
import { PaginatedResult } from 'src/common';
import { NotFoundException } from '@nestjs/common';
import { TestModuleBuilder } from '../../test-utils/test-module.builder';
import { User } from '../../user/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('LineController', () => {
  let controller: LineController;
  let service: LineService;

  const mockLineService = {
    createLine: jest.fn(),
    findAllLines: jest.fn(),
    findAllLinesSimple: jest.fn(),
    findLineBySlug: jest.fn(),
    findLinesByZone: jest.fn(),
    findLineById: jest.fn(),
    updateLine: jest.fn(),
    deleteLine: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .addController(LineController)
      .addProvider({
        provide: LineService,
        useValue: mockLineService,
      })
      .addProvider({
        provide: JwtAuthGuard,
        useValue: {
          canActivate: jest.fn().mockReturnValue(true),
        },
      })
      .addMockRepository(User)
      .addMockJwtService()
      .addMockReflector()
      .build();

    controller = module.get<LineController>(LineController);
    service = module.get<LineService>(LineService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a line', async () => {
      const createLineDto: CreateLineDto = {
        name: 'Test Line',
        slug: 'test-line',
        description: 'Test Description',
        code: 'TL001',
      };

      const mockLine = {
        id: 'test-uuid',
        ...createLineDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Line;

      mockLineService.createLine.mockResolvedValue(mockLine);

      const result = await controller.create(createLineDto);

      expect(result).toEqual(mockLine);
      expect(service.createLine).toHaveBeenCalledWith(createLineDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated lines', async () => {
      const filterDto: LineFilterDto = {
        page: 1,
        limit: 10,
      };

      const mockResult: PaginatedResult<Line> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      mockLineService.findAllLines.mockResolvedValue(mockResult);

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(mockResult);
      expect(service.findAllLines).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findAllSimple', () => {
    it('should return simple lines list', async () => {
      const mockLines: Line[] = [
        { id: 'uuid1', name: 'Line 1' } as unknown as Line,
        { id: 'uuid2', name: 'Line 2' } as unknown as Line,
      ];

      mockLineService.findAllLinesSimple.mockResolvedValue(mockLines);

      const result = await controller.findAllSimple();

      expect(result).toEqual(mockLines);
      expect(service.findAllLinesSimple).toHaveBeenCalled();
    });
  });

  describe('findBySlug', () => {
    it('should return line by slug', async () => {
      const slug = 'test-line';
      const mockLine = {
        id: 'test-uuid',
        slug,
        name: 'Test Line',
      } as unknown as Line;

      mockLineService.findLineBySlug.mockResolvedValue(mockLine);

      const result = await controller.findBySlug(slug);

      expect(result).toEqual(mockLine);
      expect(service.findLineBySlug).toHaveBeenCalledWith(slug);
    });

    it('should throw NotFoundException when line not found by slug', async () => {
      const slug = 'non-existent';

      mockLineService.findLineBySlug.mockResolvedValue(null);

      await expect(controller.findBySlug(slug)).rejects.toThrow(
        new NotFoundException(`Line với slug "${slug}" không tồn tại`),
      );
    });
  });

  describe('findByZone', () => {
    it('should return lines by zone', async () => {
      const zoneId = 'zone-uuid';
      const mockLines: Line[] = [
        { id: 'uuid1', name: 'Line 1' } as unknown as Line,
      ];

      mockLineService.findLinesByZone.mockResolvedValue(mockLines);

      const result = await controller.findByZone(zoneId);

      expect(result).toEqual(mockLines);
      expect(service.findLinesByZone).toHaveBeenCalledWith(zoneId);
    });
  });

  describe('findOne', () => {
    it('should return line by ID', async () => {
      const id = 'test-uuid';
      const mockLine = {
        id,
        name: 'Test Line',
      } as unknown as Line;

      mockLineService.findLineById.mockResolvedValue(mockLine);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockLine);
      expect(service.findLineById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when line not found by ID', async () => {
      const id = 'non-existent-uuid';

      mockLineService.findLineById.mockResolvedValue(null);

      await expect(controller.findOne(id)).rejects.toThrow(
        new NotFoundException(`Line với ID "${id}" không tồn tại`),
      );
    });
  });

  describe('update', () => {
    it('should update line', async () => {
      const id = 'test-uuid';
      const updateLineDto: UpdateLineDto = {
        name: 'Updated Line',
        description: 'Updated Description',
      };

      const mockLine = {
        id,
        ...updateLineDto,
      } as unknown as Line;

      mockLineService.updateLine.mockResolvedValue(mockLine);

      const result = await controller.update(id, updateLineDto);

      expect(result).toEqual(mockLine);
      expect(service.updateLine).toHaveBeenCalledWith(id, updateLineDto);
    });
  });

  describe('remove', () => {
    it('should remove line', async () => {
      const id = 'test-uuid';

      mockLineService.deleteLine.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(result).toEqual({ message: 'Line đã được xóa thành công' });
      expect(service.deleteLine).toHaveBeenCalledWith(id);
    });
  });
});
