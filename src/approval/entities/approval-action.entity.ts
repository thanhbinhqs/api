import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';
import { ApprovalRequest } from './approval-request.entity';
import { ApprovalStepInstance } from './approval-step-instance.entity';
import { ApprovalStatus } from '../enums';

@Entity('approval_actions')
@Index(['requestId'], { unique: false })
@Index(['stepInstanceId'], { unique: false })
@Index(['approverId'], { unique: false })
export class ApprovalAction extends BaseEntity {
  @Column()
  requestId: string;

  @Column()
  stepInstanceId: string;

  @Column()
  approverId: string; // ID người thực hiện hành động

  @Column()
  approverName: string; // Tên người thực hiện

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
  })
  action: ApprovalStatus; // APPROVED, REJECTED, RETURNED

  @Column({ type: 'text', nullable: true })
  comments: string; // Nhận xét của người phê duyệt

  @Column({ type: 'timestamp with time zone' })
  actionDate: Date; // Thời gian thực hiện hành động

  @Column({ nullable: true })
  delegatedBy: string; // ID người ủy quyền (nếu có)

  @Column({ type: 'jsonb', nullable: true })
  attachments: string[]; // Danh sách file đính kèm

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Dữ liệu bổ sung

  // Quan hệ
  @ManyToOne(() => ApprovalRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: ApprovalRequest;

  @ManyToOne(() => ApprovalStepInstance, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stepInstanceId' })
  stepInstance: ApprovalStepInstance;
}
