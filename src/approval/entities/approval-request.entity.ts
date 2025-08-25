import { Entity, Column, ManyToOne, OneToMany, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';
import { ApprovalWorkflow } from './approval-workflow.entity';
import { ApprovalStatus, ApprovalPriority } from '../enums';

@Entity('approval_requests')
@Index(['requesterId'], { unique: false })
@Index(['status'], { unique: false })
@Index(['entityType', 'entityId'], { unique: false })
export class ApprovalRequest extends BaseEntity {
  @Column()
  workflowId: string;

  @Column()
  requesterId: string; // ID người yêu cầu

  @Column()
  title: string; // Tiêu đề yêu cầu

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả chi tiết

  @Column()
  entityType: string; // Loại entity (VD: 'jig', 'task', 'part')

  @Column()
  entityId: string; // ID của entity cần phê duyệt

  @Column({ type: 'jsonb', nullable: true })
  entityData: Record<string, any>; // Dữ liệu entity tại thời điểm yêu cầu

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({
    type: 'enum',
    enum: ApprovalPriority,
    default: ApprovalPriority.NORMAL,
  })
  priority: ApprovalPriority;

  @Column({ type: 'timestamp with time zone', nullable: true })
  submittedAt: Date; // Thời gian gửi yêu cầu

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date; // Thời gian hoàn thành

  @Column({ type: 'timestamp with time zone', nullable: true })
  dueDate: Date; // Hạn chót

  @Column({ type: 'text', nullable: true })
  rejectionReason: string; // Lý do từ chối

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Dữ liệu bổ sung

  @Column({ nullable: true })
  currentStepId: string; // Bước hiện tại

  @Column({ type: 'int', default: 1 })
  currentStepOrder: number; // Thứ tự bước hiện tại

  // Quan hệ
  @ManyToOne(() => ApprovalWorkflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: ApprovalWorkflow;

  // Quan hệ sẽ được định nghĩa sau
  @OneToMany('ApprovalStepInstance', 'request')
  stepInstances: any[];

  @OneToMany('ApprovalComment', 'request')
  comments: any[];

  attachments: any[];
}
