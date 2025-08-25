import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto } from '../dto/project/create-project.dto';
import { UpdateProjectDto } from '../dto/project/update-project.dto';
import { ProjectFilterDto } from '../dto/project/project-filter.dto';
import { Project } from '../entities/project.entity';
import { PaginatedResult } from 'src/common';
import { NotFoundException } from '@nestjs/common';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;

  const mockProjectService = {
    createProject: jest.fn(),
    findAllProjects: jest.fn(),
    findAllProjectsSimple: jest.fn(),
    findProjectBySlug: jest.fn(),
    findProjectById: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a project', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        slug: 'test-project',
        friendlyName: 'Test Project Friendly',
        code: 'TP001',
        description: 'Test Description',
      };

      const mockProject = {
        id: 'test-uuid',
        ...createProjectDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Project;

      mockProjectService.createProject.mockResolvedValue(mockProject);

      const result = await controller.create(createProjectDto);

      expect(result).toEqual(mockProject);
      expect(service.createProject).toHaveBeenCalledWith(createProjectDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated projects', async () => {
      const filterDto: ProjectFilterDto = {
        page: 1,
        limit: 10,
      };

      const mockResult: PaginatedResult<Project> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      mockProjectService.findAllProjects.mockResolvedValue(mockResult);

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(mockResult);
      expect(service.findAllProjects).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findAllSimple', () => {
    it('should return simple projects list', async () => {
      const mockProjects: Project[] = [
        { id: 'uuid1', name: 'Project 1' } as unknown as Project,
        { id: 'uuid2', name: 'Project 2' } as unknown as Project,
      ];

      mockProjectService.findAllProjectsSimple.mockResolvedValue(mockProjects);

      const result = await controller.findAllSimple();

      expect(result).toEqual(mockProjects);
      expect(service.findAllProjectsSimple).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return project by ID', async () => {
      const id = 'test-uuid';
      const mockProject = {
        id,
        name: 'Test Project',
      } as unknown as Project;

      mockProjectService.findProjectById.mockResolvedValue(mockProject);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockProject);
      expect(service.findProjectById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when project not found by ID', async () => {
      const id = 'non-existent-uuid';

      mockProjectService.findProjectById.mockResolvedValue(null);

      await expect(controller.findOne(id)).rejects.toThrow(
        new NotFoundException(`Project với ID "${id}" không tồn tại`)
      );
    });
  });

  describe('update', () => {
    it('should update project', async () => {
      const id = 'test-uuid';
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Project',
        description: 'Updated Description',
      };

      const mockProject = {
        id,
        ...updateProjectDto,
      } as unknown as Project;

      mockProjectService.updateProject.mockResolvedValue(mockProject);

      const result = await controller.update(id, updateProjectDto);

      expect(result).toEqual(mockProject);
      expect(service.updateProject).toHaveBeenCalledWith(id, updateProjectDto);
    });
  });

  describe('remove', () => {
    it('should remove project', async () => {
      const id = 'test-uuid';

      mockProjectService.deleteProject.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(result).toEqual({ message: 'Project đã được xóa thành công' });
      expect(service.deleteProject).toHaveBeenCalledWith(id);
    });
  });
});
