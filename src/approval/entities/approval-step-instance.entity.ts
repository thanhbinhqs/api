import { Entity, Column, ManyToOne, OneToMany, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';
import { ApprovalRequest } from './approval-request.entity';
import { ApprovalStep } from './approval-step.entity';
import { ApprovalStepStatus } from '../enums';

@Entity('approval_step_instances')
@Index(['requestId', 'stepOrder'], { unique: true })
export class ApprovalStepInstance extends BaseEntity {
  @Column()
  requestId: string;

  @Column()
  stepId: string;

  @Column({ type: 'int' })
  stepOrder: number; // Thứ tự bước

  @Column()
  name: string; // Tên bước

  @Column({
    type: 'enum',
    enum: ApprovalStepStatus,
    default: ApprovalStepStatus.WAITING,
  })
  status: ApprovalStepStatus;

  @Column({ type: 'jsonb' })
  assignedApprovers: string[]; // Danh sách người được giao phê duyệt

  @Column({ type: 'int', default: 1 })
  requiredApprovals: number; // Số lượng phê duyệt cần thiết

  @Column({ type: 'int', default: 0 })
  currentApprovals: number; // Số lượng đã phê duyệt

  @Column({ type: 'timestamp with time zone', nullable: true })
  startedAt: Date; // Thời gian bắt đầu bước

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date; // Thời gian hoàn thành bước

  @Column({ type: 'timestamp with time zone', nullable: true })
  dueDate: Date; // Hạn chót cho bước này

  @Column({ type: 'text', nullable: true })
  comments: string; // Ghi chú cho bước

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Dữ liệu bổ sung

  // Quan hệ
  @ManyToOne(() => ApprovalRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: ApprovalRequest;

  @ManyToOne(() => ApprovalStep, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stepId' })
  step: ApprovalStep;

  // Quan hệ sẽ được định nghĩa sau
  @OneToMany('ApprovalAction', 'stepInstance')
  actions: any[];
}
