import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';
import { ApprovalRequest } from './approval-request.entity';

@Entity('approval_comments')
@Index(['requestId'], { unique: false })
@Index(['userId'], { unique: false })
export class ApprovalComment extends BaseEntity {
  @Column()
  requestId: string;

  @Column()
  userId: string; // ID người bình luận

  @Column()
  userName: string; // Tên người bình luận

  @Column({ type: 'text' })
  content: string; // Nội dung bình luận

  @Column({ default: false })
  isInternal: boolean; // Bình luận nội bộ (chỉ admin/approver thấy)

  @Column({ type: 'jsonb', nullable: true })
  attachments: string[]; // Danh sách file đính kèm

  @Column({ nullable: true })
  parentCommentId: string; // ID bình luận cha (để tạo thread)

  @Column({ type: 'timestamp with time zone' })
  commentDate: Date; // Thời gian bình luận

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Dữ liệu bổ sung

  // Quan hệ
  @ManyToOne(() => ApprovalRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: ApprovalRequest;

  @ManyToOne(() => ApprovalComment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment: ApprovalComment;
}
