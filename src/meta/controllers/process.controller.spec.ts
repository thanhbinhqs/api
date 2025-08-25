import { Test, TestingModule } from '@nestjs/testing';
import { ProcessController } from './process.controller';
import { ProcessService } from '../services/process.service';
import { CreateProcessDto } from '../dto/process/create-process.dto';
import { UpdateProcessDto } from '../dto/process/update-process.dto';
import { ProcessFilterDto } from '../dto/process/process-filter.dto';
import { Process } from '../entities/process.entity';
import { PaginatedResult } from 'src/common';
import { NotFoundException } from '@nestjs/common';

describe('ProcessController', () => {
  let controller: ProcessController;
  let service: ProcessService;

  const mockProcessService = {
    createProcess: jest.fn(),
    findAllProcesses: jest.fn(),
    findAllProcessesSimple: jest.fn(),
    findProcessBySlug: jest.fn(),
    findProcessById: jest.fn(),
    updateProcess: jest.fn(),
    deleteProcess: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessController],
      providers: [
        {
          provide: ProcessService,
          useValue: mockProcessService,
        },
      ],
    }).compile();

    controller = module.get<ProcessController>(ProcessController);
    service = module.get<ProcessService>(ProcessService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a process', async () => {
      const createProcessDto: CreateProcessDto = {
        name: 'Test Process',
        slug: 'test-process',
        description: 'Test Description',
        code: 'TP001',
      };

      const mockProcess = {
        id: 'test-uuid',
        ...createProcessDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Process;

      mockProcessService.createProcess.mockResolvedValue(mockProcess);

      const result = await controller.create(createProcessDto);

      expect(result).toEqual(mockProcess);
      expect(service.createProcess).toHaveBeenCalledWith(createProcessDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated processes', async () => {
      const filterDto: ProcessFilterDto = {
        page: 1,
        limit: 10,
      };

      const mockResult: PaginatedResult<Process> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      mockProcessService.findAllProcesses.mockResolvedValue(mockResult);

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(mockResult);
      expect(service.findAllProcesses).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findAllSimple', () => {
    it('should return simple processes list', async () => {
      const mockProcesses: Process[] = [
        { id: 'uuid1', name: 'Process 1' } as unknown as Process,
        { id: 'uuid2', name: 'Process 2' } as unknown as Process,
      ];

      mockProcessService.findAllProcessesSimple.mockResolvedValue(mockProcesses);

      const result = await controller.findAllSimple();

      expect(result).toEqual(mockProcesses);
      expect(service.findAllProcessesSimple).toHaveBeenCalled();
    });
  });

  describe('findBySlug', () => {
    it('should return process by slug', async () => {
      const slug = 'test-process';
      const mockProcess = {
        id: 'test-uuid',
        slug,
        name: 'Test Process',
      } as unknown as Process;

      mockProcessService.findProcessBySlug.mockResolvedValue(mockProcess);

      const result = await controller.findBySlug(slug);

      expect(result).toEqual(mockProcess);
      expect(service.findProcessBySlug).toHaveBeenCalledWith(slug);
    });

    it('should throw NotFoundException when process not found by slug', async () => {
      const slug = 'non-existent';

      mockProcessService.findProcessBySlug.mockResolvedValue(null);

      await expect(controller.findBySlug(slug)).rejects.toThrow(
        new NotFoundException(`Process với slug "${slug}" không tồn tại`)
      );
    });
  });

  describe('findOne', () => {
    it('should return process by ID', async () => {
      const id = 'test-uuid';
      const mockProcess = {
        id,
        name: 'Test Process',
      } as unknown as Process;

      mockProcessService.findProcessById.mockResolvedValue(mockProcess);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockProcess);
      expect(service.findProcessById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when process not found by ID', async () => {
      const id = 'non-existent-uuid';

      mockProcessService.findProcessById.mockResolvedValue(null);

      await expect(controller.findOne(id)).rejects.toThrow(
        new NotFoundException(`Process với ID "${id}" không tồn tại`)
      );
    });
  });

  describe('update', () => {
    it('should update process', async () => {
      const id = 'test-uuid';
      const updateProcessDto: UpdateProcessDto = {
        name: 'Updated Process',
        description: 'Updated Description',
      };

      const mockProcess = {
        id,
        ...updateProcessDto,
      } as unknown as Process;

      mockProcessService.updateProcess.mockResolvedValue(mockProcess);

      const result = await controller.update(id, updateProcessDto);

      expect(result).toEqual(mockProcess);
      expect(service.updateProcess).toHaveBeenCalledWith(id, updateProcessDto);
    });
  });

  describe('remove', () => {
    it('should remove process', async () => {
      const id = 'test-uuid';

      mockProcessService.deleteProcess.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(result).toEqual({ message: 'Process đã được xóa thành công' });
      expect(service.deleteProcess).toHaveBeenCalledWith(id);
    });
  });
});
