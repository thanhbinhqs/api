import { DataSource } from 'typeorm';
import { Task, TaskType, TaskPriority, TaskStatus, AssigneeType } from '../entities/task.entity';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../user/entities/role.entity';
import { Jig } from '../../jig/entities/jig.entity';
import { JigDetail } from '../../jig/entities/jig-detail.entity';

export async function seedTaskDemoData(dataSource: DataSource) {
  const taskRepository = dataSource.getRepository(Task);
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const jigRepository = dataSource.getRepository(Jig);
  const jigDetailRepository = dataSource.getRepository(JigDetail);

  // Lấy data cần thiết
  const adminUser = await userRepository.findOne({ where: { username: 'admin' } });
  const technicianRole = await roleRepository.findOne({ where: { name: 'technician' } });
  const supervisorRole = await roleRepository.findOne({ where: { name: 'supervisor' } });
  
  const sampleJig = await jigRepository.findOne({ relations: ['details'] });
  const sampleJigDetail = await jigDetailRepository.findOne({ relations: ['jig'] });

  if (!adminUser) {
    console.log('❌ Không tìm thấy admin user');
    return;
  }

  // Tạo sample tasks
  const sampleTasks = [
    {
      title: 'Kiểm tra định kỳ máy hàn A1',
      description: 'Kiểm tra hoạt động và tình trạng máy hàn A1 theo quy trình định kỳ',
      type: TaskType.INSPECTION,
      priority: TaskPriority.HIGH,
      status: TaskStatus.PENDING,
      assigneeType: AssigneeType.ROLE,
      taskCreatedBy: adminUser,
      assignedRoles: technicianRole ? [technicianRole] : [],
      scheduledStartDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Ngày mai
      scheduledEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Ngày mai + 2h
      estimatedDuration: 120,
      relatedJig: sampleJig,
      checklist: [
        { id: '1', title: 'Kiểm tra nguồn điện', completed: false, required: true },
        { id: '2', title: 'Kiểm tra cảm biến nhiệt độ', completed: false, required: true },
        { id: '3', title: 'Kiểm tra áp suất khí', completed: false, required: false },
        { id: '4', title: 'Làm sạch bề mặt', completed: false, required: true }
      ],
      tags: ['inspection', 'routine', 'welding-machine']
    },
    {
      title: 'Bảo trì định kỳ jig detail JD001',
      description: 'Bảo trì và bôi trơn jig detail JD001',
      type: TaskType.MAINTENANCE,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      assigneeType: AssigneeType.ROLE,
      taskCreatedBy: adminUser,
      assignedRoles: technicianRole ? [technicianRole] : [],
      scheduledStartDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 ngày nữa
      scheduledEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 ngày + 3h
      estimatedDuration: 180,
      relatedJigDetail: sampleJigDetail,
      isRecurring: true,
      recurringInterval: 30, // 30 ngày
      checklist: [
        { id: '1', title: 'Tháo rời các bộ phận', completed: false, required: true },
        { id: '2', title: 'Làm sạch bằng dung dịch tẩy rửa', completed: false, required: true },
        { id: '3', title: 'Kiểm tra độ mòn', completed: false, required: true },
        { id: '4', title: 'Bôi trơn các khớp nối', completed: false, required: true },
        { id: '5', title: 'Lắp ráp lại', completed: false, required: true },
        { id: '6', title: 'Test hoạt động', completed: false, required: true }
      ],
      tags: ['maintenance', 'recurring', 'lubrication']
    },
    {
      title: 'Sửa chữa thiết bị cắt laser',
      description: 'Thay thế lens bị hỏng và hiệu chuẩn lại hệ thống',
      type: TaskType.REPAIR,
      priority: TaskPriority.URGENT,
      status: TaskStatus.IN_PROGRESS,
      assigneeType: AssigneeType.USER,
      taskCreatedBy: adminUser,
      scheduledStartDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h trước
      scheduledEndDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4h nữa
      actualStartDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h trước
      estimatedDuration: 360,
      checklist: [
        { id: '1', title: 'Tắt nguồn và đảm bảo an toàn', completed: true, required: true },
        { id: '2', title: 'Tháo lens cũ', completed: true, required: true },
        { id: '3', title: 'Lắp lens mới', completed: false, required: true },
        { id: '4', title: 'Hiệu chuẩn hệ thống', completed: false, required: true },
        { id: '5', title: 'Test cắt thử', completed: false, required: true }
      ],
      tags: ['repair', 'urgent', 'laser', 'lens-replacement']
    },
    {
      title: 'Vệ sinh khu vực sản xuất A',
      description: 'Vệ sinh tổng thể khu vực sản xuất A, bao gồm máy móc và nền nhà',
      type: TaskType.CLEANING,
      priority: TaskPriority.LOW,
      status: TaskStatus.COMPLETED,
      assigneeType: AssigneeType.ROLE,
      taskCreatedBy: adminUser,
      assignedRoles: technicianRole ? [technicianRole] : [],
      scheduledStartDate: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 ngày trước
      scheduledEndDate: new Date(Date.now() - 46 * 60 * 60 * 1000), // 2 ngày trước + 2h
      actualStartDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
      actualEndDate: new Date(Date.now() - 46.5 * 60 * 60 * 1000), // Hoàn thành sớm 30p
      estimatedDuration: 120,
      actualDuration: 90,
      completionNotes: 'Đã vệ sinh xong. Phát hiện một số vết dầu cần xử lý đặc biệt.',
      checklist: [
        { id: '1', title: 'Quét sạch nền nhà', completed: true, required: true },
        { id: '2', title: 'Lau chùi máy móc', completed: true, required: true },
        { id: '3', title: 'Xử lý vết dầu', completed: true, required: false },
        { id: '4', title: 'Kiểm tra và sắp xếp dụng cụ', completed: true, required: true }
      ],
      tags: ['cleaning', 'production-area', 'completed']
    },
    {
      title: 'Hiệu chuẩn cân điện tử',
      description: 'Hiệu chuẩn lại độ chính xác của cân điện tử sử dụng trong QC',
      type: TaskType.CALIBRATION,
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.OVERDUE,
      assigneeType: AssigneeType.ROLE,
      taskCreatedBy: adminUser,
      assignedRoles: supervisorRole ? [supervisorRole] : [],
      scheduledStartDate: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25h trước (quá hạn)
      scheduledEndDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h trước
      estimatedDuration: 60,
      checklist: [
        { id: '1', title: 'Chuẩn bị quả cân chuẩn', completed: false, required: true },
        { id: '2', title: 'Thực hiện hiệu chuẩn', completed: false, required: true },
        { id: '3', title: 'Ghi nhận kết quả', completed: false, required: true },
        { id: '4', title: 'Dán tem hiệu chuẩn', completed: false, required: true }
      ],
      tags: ['calibration', 'overdue', 'scale', 'qc']
    }
  ];

  // Lưu tasks
  for (const taskData of sampleTasks) {
    const existingTask = await taskRepository.findOne({
      where: { title: taskData.title }
    });

    if (!existingTask) {
      const task = new Task();
      task.title = taskData.title;
      task.description = taskData.description;
      task.type = taskData.type;
      task.priority = taskData.priority;
      task.status = taskData.status;
      task.assigneeType = taskData.assigneeType;
      task.taskCreatedBy = taskData.taskCreatedBy;
      task.scheduledStartDate = taskData.scheduledStartDate;
      task.scheduledEndDate = taskData.scheduledEndDate;
      task.estimatedDuration = taskData.estimatedDuration;
      task.checklist = taskData.checklist;
      task.tags = taskData.tags;

      if (taskData.actualStartDate) task.actualStartDate = taskData.actualStartDate;
      if (taskData.actualEndDate) task.actualEndDate = taskData.actualEndDate;
      if (taskData.actualDuration) task.actualDuration = taskData.actualDuration;
      if (taskData.completionNotes) task.completionNotes = taskData.completionNotes;
      if (taskData.relatedJig) task.relatedJig = taskData.relatedJig;
      if (taskData.relatedJigDetail) task.relatedJigDetail = taskData.relatedJigDetail;
      if (taskData.isRecurring) task.isRecurring = taskData.isRecurring;
      if (taskData.recurringInterval) task.recurringInterval = taskData.recurringInterval;
      if (taskData.assignedRoles?.length) task.assignedRoles = taskData.assignedRoles;

      await taskRepository.save(task);
      console.log(`✅ Đã tạo task: ${taskData.title}`);
    }
  }

  console.log('✅ Hoàn thành tạo demo data cho Task module');
}
