import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import {
  TaskType,
  TaskPriority,
  TaskStatus,
  AssigneeType,
} from './entities/task.entity';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  const mockTaskService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    assignTask: jest.fn(),
    completeTask: jest.fn(),
    getTaskStatistics: jest.fn(),
    getUpcomingTasks: jest.fn(),
    createMaintenanceTasks: jest.fn(),
    updateOverdueTasks: jest.fn(),
  };

  const mockGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(PermissionGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        type: TaskType.MANUAL,
        priority: TaskPriority.MEDIUM,
        assigneeType: AssigneeType.USER,
        assignedUserIds: ['user-id-1'],
      };

      const expectedTask = {
        id: 'task-id',
        ...createTaskDto,
        status: TaskStatus.PENDING,
      };

      mockTaskService.create.mockResolvedValue(expectedTask);

      const req = { user: { id: 'user-id' } };
      const result = await controller.create(createTaskDto, req);

      expect(service.create).toHaveBeenCalledWith(createTaskDto, 'user-id');
      expect(result).toEqual(expectedTask);
    });
  });

  describe('findAll', () => {
    it('should return all tasks with filter', async () => {
      const filterDto = { page: 1, limit: 10, status: TaskStatus.PENDING };
      const expectedResult = {
        tasks: [{ id: 'task-1', title: 'Task 1' }],
        total: 1,
      };

      mockTaskService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const taskId = 'task-id';
      const expectedTask = { id: taskId, title: 'Test Task' };

      mockTaskService.findOne.mockResolvedValue(expectedTask);

      const result = await controller.findOne(taskId);

      expect(service.findOne).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(expectedTask);
    });
  });

  describe('assignTask', () => {
    it('should assign task to user', async () => {
      const taskId = 'task-id';
      const userId = 'user-id';
      const expectedTask = { id: taskId, executedBy: { id: userId } };

      mockTaskService.assignTask.mockResolvedValue(expectedTask);

      const result = await controller.assignTask(taskId, userId);

      expect(service.assignTask).toHaveBeenCalledWith(taskId, userId);
      expect(result).toEqual(expectedTask);
    });
  });

  describe('completeTask', () => {
    it('should complete a task', async () => {
      const taskId = 'task-id';
      const completeData = {
        completionNotes: 'Task completed successfully',
        checklist: [
          { id: '1', title: 'Check 1', completed: true, required: true },
        ],
      };
      const expectedTask = { id: taskId, status: TaskStatus.COMPLETED };

      mockTaskService.completeTask.mockResolvedValue(expectedTask);

      const result = await controller.completeTask(taskId, completeData);

      expect(service.completeTask).toHaveBeenCalledWith(
        taskId,
        completeData.completionNotes,
        completeData.checklist,
      );
      expect(result).toEqual(expectedTask);
    });
  });

  describe('getStatistics', () => {
    it('should return task statistics', async () => {
      const req = { user: { id: 'user-id', permissions: [] } };
      const expectedStats = {
        totalTasks: 10,
        pendingTasks: 3,
        inProgressTasks: 2,
        completedTasks: 5,
        overdueTasks: 0,
        maintenanceTasks: 4,
      };

      mockTaskService.getTaskStatistics.mockResolvedValue(expectedStats);

      const result = await controller.getStatistics(req);

      expect(service.getTaskStatistics).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(expectedStats);
    });
  });

  describe('getUpcomingTasks', () => {
    it('should return upcoming tasks', async () => {
      const req = { user: { id: 'user-id', permissions: [] } };
      const expectedTasks = [
        { id: 'task-1', title: 'Upcoming Task 1' },
        { id: 'task-2', title: 'Upcoming Task 2' },
      ];

      mockTaskService.getUpcomingTasks.mockResolvedValue(expectedTasks);

      const result = await controller.getUpcomingTasks(req, '7');

      expect(service.getUpcomingTasks).toHaveBeenCalledWith(7, 'user-id');
      expect(result).toEqual(expectedTasks);
    });
  });
});
