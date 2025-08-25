import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';
import { ApprovalType } from '../enums';

@Entity('approval_workflows')
@Index(['code'], { unique: true })
export class ApprovalWorkflow extends BaseEntity {
  @Column({ unique: true })
  code: string; // Mã quy trình (VD: JIG_APPROVAL, TASK_APPROVAL)

  @Column()
  name: string; // Tên quy trình

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả

  @Column({
    type: 'enum',
    enum: ApprovalType,
    default: ApprovalType.SEQUENTIAL,
  })
  type: ApprovalType; // Loại phê duyệt

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>; // Cấu hình bổ sung

  @Column({ type: 'int', default: 1 })
  workflowVersion: number; // Phiên bản quy trình

  // Quan hệ
  @OneToMany('ApprovalStep', 'workflow')
  steps: any[];

  @OneToMany('ApprovalRequest', 'workflow')
  requests: any[];
}
