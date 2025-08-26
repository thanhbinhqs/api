import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';
import { ApprovalWorkflow } from './approval-workflow.entity';
import { ApprovalStepStatus } from '../enums';

@Entity('approval_steps')
@Index(['workflowId', 'stepOrder'], { unique: true })
export class ApprovalStep extends BaseEntity {
  @Column()
  workflowId: string;

  @Column()
  name: string; // Tên bước (VD: "Phê duyệt cấp trưởng phòng")

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  stepOrder: number; // Thứ tự bước (1, 2, 3...)

  @Column({ type: 'jsonb' })
  approvers: string[]; // Danh sách ID người phê duyệt

  @Column({ type: 'jsonb', nullable: true })
  approverRoles: string[]; // Danh sách vai trò có thể phê duyệt

  @Column({ type: 'int', default: 1 })
  requiredApprovals: number; // Số lượng phê duyệt cần thiết

  @Column({ type: 'int', nullable: true })
  timeoutHours: number; // Thời gian timeout (giờ)

  @Column({ default: false })
  isOptional: boolean; // Bước tùy chọn có thể bỏ qua

  @Column({ default: false })
  canDelegate: boolean; // Có thể ủy quyền

  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, any>; // Điều kiện để thực hiện bước này

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>; // Cấu hình bổ sung

  // Quan hệ
  @ManyToOne(() => ApprovalWorkflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: ApprovalWorkflow;

  // Quan hệ sẽ được định nghĩa sau
  @OneToMany('ApprovalStepInstance', 'step')
  stepInstances: any[];
}
