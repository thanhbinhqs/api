import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';

@Entity('approval_delegations')
@Index(['fromUserId'], { unique: false })
@Index(['toUserId'], { unique: false })
@Index(['workflowCode'], { unique: false })
export class ApprovalDelegation extends BaseEntity {
  @Column()
  fromUserId: string; // ID người ủy quyền

  @Column()
  toUserId: string; // ID người được ủy quyền

  @Column({ nullable: true })
  workflowCode: string; // Mã quy trình (null = tất cả quy trình)

  @Column({ type: 'timestamp with time zone' })
  startDate: Date; // Ngày bắt đầu ủy quyền

  @Column({ type: 'timestamp with time zone' })
  endDate: Date; // Ngày kết thúc ủy quyền

  @Column({ type: 'text', nullable: true })
  reason: string; // Lý do ủy quyền

  @Column({ default: true })
  delegationActive: boolean; // Trạng thái hoạt động ủy quyền

  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, any>; // Điều kiện ủy quyền

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Dữ liệu bổ sung
}
