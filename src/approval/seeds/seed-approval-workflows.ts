import { DataSource } from 'typeorm';
import { ApprovalWorkflow, ApprovalStep } from '../entities';
import { ApprovalType } from '../enums';

export async function seedApprovalWorkflows(dataSource: DataSource) {
  const workflowRepository = dataSource.getRepository(ApprovalWorkflow);
  const stepRepository = dataSource.getRepository(ApprovalStep);

  // Quy trình phê duyệt Jig
  const jigWorkflow = workflowRepository.create({
    code: 'JIG_APPROVAL',
    name: 'Quy trình phê duyệt Jig',
    description: 'Quy trình phê duyệt thiết kế và sản xuất jig',
    type: ApprovalType.SEQUENTIAL,
    config: {
      autoAssign: true,
      allowDelegate: true,
      timeoutAction: 'escalate',
    },
  });

  const savedJigWorkflow = await workflowRepository.save(jigWorkflow);

  // Các bước cho quy trình Jig
  const jigSteps = [
    {
      workflowId: savedJigWorkflow.id,
      name: 'Kiểm tra thiết kế',
      description: 'Kiểm tra tính khả thi và chính xác của thiết kế',
      stepOrder: 1,
      approvers: ['design-manager-id'],
      approverRoles: ['DESIGN_MANAGER'],
      requiredApprovals: 1,
      timeoutHours: 24,
      canDelegate: true,
    },
    {
      workflowId: savedJigWorkflow.id,
      name: 'Phê duyệt trưởng phòng sản xuất',
      description: 'Phê duyệt về mặt sản xuất và cost',
      stepOrder: 2,
      approvers: ['production-manager-id'],
      approverRoles: ['PRODUCTION_MANAGER'],
      requiredApprovals: 1,
      timeoutHours: 48,
      canDelegate: true,
    },
    {
      workflowId: savedJigWorkflow.id,
      name: 'Phê duyệt giám đốc',
      description: 'Phê duyệt cuối cùng từ giám đốc',
      stepOrder: 3,
      approvers: ['director-id'],
      approverRoles: ['DIRECTOR'],
      requiredApprovals: 1,
      timeoutHours: 72,
      canDelegate: false,
    },
  ];

  for (const stepData of jigSteps) {
    const step = stepRepository.create(stepData);
    await stepRepository.save(step);
  }

  // Quy trình phê duyệt Task
  const taskWorkflow = workflowRepository.create({
    code: 'TASK_APPROVAL',
    name: 'Quy trình phê duyệt Task',
    description: 'Quy trình phê duyệt nhiệm vụ quan trọng',
    type: ApprovalType.SEQUENTIAL,
    config: {
      autoAssign: true,
      allowDelegate: true,
    },
  });

  const savedTaskWorkflow = await workflowRepository.save(taskWorkflow);

  // Các bước cho quy trình Task
  const taskSteps = [
    {
      workflowId: savedTaskWorkflow.id,
      name: 'Phê duyệt team lead',
      description: 'Kiểm tra và phê duyệt từ team lead',
      stepOrder: 1,
      approvers: ['team-lead-id'],
      approverRoles: ['TEAM_LEAD'],
      requiredApprovals: 1,
      timeoutHours: 12,
      canDelegate: true,
    },
    {
      workflowId: savedTaskWorkflow.id,
      name: 'Phê duyệt manager',
      description: 'Phê duyệt cuối từ manager',
      stepOrder: 2,
      approvers: ['manager-id'],
      approverRoles: ['MANAGER'],
      requiredApprovals: 1,
      timeoutHours: 24,
      canDelegate: true,
    },
  ];

  for (const stepData of taskSteps) {
    const step = stepRepository.create(stepData);
    await stepRepository.save(step);
  }

  // Quy trình phê duyệt Part
  const partWorkflow = workflowRepository.create({
    code: 'PART_APPROVAL',
    name: 'Quy trình phê duyệt Part',
    description: 'Quy trình phê duyệt linh kiện/part mới',
    type: ApprovalType.PARALLEL,
    config: {
      autoAssign: true,
      allowDelegate: true,
      requireAllApprovals: false,
    },
  });

  const savedPartWorkflow = await workflowRepository.save(partWorkflow);

  // Quy trình phê duyệt Jig Order
  const jigOrderWorkflow = workflowRepository.create({
    code: 'JIG_ORDER_APPROVAL',
    name: 'Quy trình phê duyệt Đơn hàng Jig',
    description: 'Quy trình phê duyệt đơn hàng jig từ xa',
    type: ApprovalType.SEQUENTIAL,
    config: {
      autoAssign: true,
      allowDelegate: true,
      timeoutAction: 'escalate',
    },
  });

  const savedJigOrderWorkflow = await workflowRepository.save(jigOrderWorkflow);

  // Các bước cho quy trình Jig Order
  const jigOrderSteps = [
    {
      workflowId: savedJigOrderWorkflow.id,
      name: 'Kiểm tra yêu cầu',
      description: 'Kiểm tra tính hợp lệ của yêu cầu đơn hàng',
      stepOrder: 1,
      approvers: ['supervisor-id'],
      approverRoles: ['SUPERVISOR'],
      requiredApprovals: 1,
      timeoutHours: 8,
      canDelegate: true,
    },
    {
      workflowId: savedJigOrderWorkflow.id,
      name: 'Phê duyệt manager',
      description: 'Phê duyệt từ quản lý bộ phận',
      stepOrder: 2,
      approvers: ['department-manager-id'],
      approverRoles: ['DEPARTMENT_MANAGER'],
      requiredApprovals: 1,
      timeoutHours: 24,
      canDelegate: true,
    },
  ];

  for (const stepData of taskSteps) {
    const step = stepRepository.create(stepData);
    await stepRepository.save(step);
  }

  for (const stepData of jigOrderSteps) {
    const step = stepRepository.create(stepData);
    await stepRepository.save(step);
  }

  // Các bước cho quy trình Part (parallel)
  const partSteps = [
    {
      workflowId: savedPartWorkflow.id,
      name: 'Kiểm tra kỹ thuật',
      description: 'Kiểm tra thông số kỹ thuật',
      stepOrder: 1,
      approvers: ['technical-lead-id'],
      approverRoles: ['TECHNICAL_LEAD'],
      requiredApprovals: 1,
      timeoutHours: 24,
      canDelegate: true,
    },
    {
      workflowId: savedPartWorkflow.id,
      name: 'Kiểm tra chất lượng',
      description: 'Kiểm tra tiêu chuẩn chất lượng',
      stepOrder: 1, // Cùng order để chạy parallel
      approvers: ['quality-manager-id'],
      approverRoles: ['QUALITY_MANAGER'],
      requiredApprovals: 1,
      timeoutHours: 24,
      canDelegate: true,
    },
    {
      workflowId: savedPartWorkflow.id,
      name: 'Phê duyệt cuối',
      description: 'Phê duyệt cuối cùng',
      stepOrder: 2,
      approvers: ['general-manager-id'],
      approverRoles: ['GENERAL_MANAGER'],
      requiredApprovals: 1,
      timeoutHours: 48,
      canDelegate: false,
    },
  ];

  for (const stepData of partSteps) {
    const step = stepRepository.create(stepData);
    await stepRepository.save(step);
  }

  console.log('✅ Seeded approval workflows and steps successfully');
}

export async function seedApprovalData(dataSource: DataSource) {
  try {
    await seedApprovalWorkflows(dataSource);
  } catch (error) {
    console.error('❌ Error seeding approval data:', error);
    throw error;
  }
}
