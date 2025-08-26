import { BaseEntity } from 'src/common/entities/base-entity';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/user/entities/role.entity';
import { Jig } from 'src/jig/entities/jig.entity';
import { JigDetail } from 'src/jig/entities/jig-detail.entity';
import { Column, Entity, ManyToOne, ManyToMany, JoinTable } from 'typeorm';

export enum TaskType {
  MANUAL = 'manual',
  MAINTENANCE = 'maintenance',
  INSPECTION = 'inspection',
  REPAIR = 'repair',
  CLEANING = 'cleaning',
  CALIBRATION = 'calibration',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export enum AssigneeType {
  USER = 'user',
  ROLE = 'role',
}

@Entity('tasks')
export class Task extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Nội dung chi tiết của task (có thể chứa HTML, markdown, etc.)
  @Column({ type: 'text', nullable: true })
  content?: string;

  // Loại nội dung: html, markdown, plain_text
  @Column({ type: 'varchar', default: 'plain_text' })
  contentType?: 'html' | 'markdown' | 'plain_text' = 'plain_text';

  @Column({
    type: 'varchar',
    default: TaskType.MANUAL,
    transformer: {
      to: (value: TaskType) => value,
      from: (value: string) => value as TaskType,
    },
  })
  type: TaskType;

  @Column({
    type: 'varchar',
    default: TaskPriority.MEDIUM,
    transformer: {
      to: (value: TaskPriority) => value,
      from: (value: string) => value as TaskPriority,
    },
  })
  priority: TaskPriority;

  @Column({
    type: 'varchar',
    default: TaskStatus.PENDING,
    transformer: {
      to: (value: TaskStatus) => value,
      from: (value: string) => value as TaskStatus,
    },
  })
  status: TaskStatus;

  @Column({
    type: 'varchar',
    default: AssigneeType.USER,
    transformer: {
      to: (value: AssigneeType) => value,
      from: (value: string) => value as AssigneeType,
    },
  })
  assigneeType: AssigneeType;

  // Task được giao cho user cụ thể
  @ManyToMany(() => User, { nullable: true })
  @JoinTable({
    name: 'task_assigned_users',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  assignedUsers?: User[];

  // Task được giao cho role/nhóm
  @ManyToMany(() => Role, { nullable: true })
  @JoinTable({
    name: 'task_assigned_roles',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  assignedRoles?: Role[];

  // User thực hiện task (người thực sự làm)
  @ManyToOne(() => User, { nullable: true })
  executedBy?: User;

  // User tạo task
  @ManyToOne(() => User, { nullable: false })
  taskCreatedBy: User;

  // Thời gian dự kiến bắt đầu
  @Column({ type: 'timestamp with time zone', nullable: true })
  scheduledStartDate?: Date;

  // Thời gian dự kiến hoàn thành
  @Column({ type: 'timestamp with time zone', nullable: true })
  scheduledEndDate?: Date;

  // Thời gian thực tế bắt đầu
  @Column({ type: 'timestamp with time zone', nullable: true })
  actualStartDate?: Date;

  // Thời gian thực tế hoàn thành
  @Column({ type: 'timestamp with time zone', nullable: true })
  actualEndDate?: Date;

  // Thời gian ước tính hoàn thành (phút)
  @Column({ nullable: true })
  estimatedDuration?: number;

  // Thời gian thực tế (phút)
  @Column({ nullable: true })
  actualDuration?: number;

  // Ghi chú khi hoàn thành
  @Column({ type: 'text', nullable: true })
  completionNotes?: string;

  // Task có liên quan đến Jig
  @ManyToOne(() => Jig, { nullable: true })
  relatedJig?: Jig;

  // Task có liên quan đến JigDetail
  @ManyToOne(() => JigDetail, { nullable: true })
  relatedJigDetail?: JigDetail;

  // Tự động tạo task định kỳ (cho bảo trì)
  @Column({ default: false })
  isRecurring: boolean;

  // Khoảng thời gian lặp lại (ngày)
  @Column({ nullable: true })
  recurringInterval?: number;

  // Task cha (nếu đây là task con được tạo từ recurring)
  @ManyToOne(() => Task, { nullable: true })
  parentTask?: Task;

  // Checklist items (JSON format)
  @Column({ type: 'jsonb', nullable: true })
  checklist?: {
    id: string;
    title: string;
    completed: boolean;
    required: boolean;
  }[];

  // File đính kèm (sử dụng file manager)
  @Column({ type: 'jsonb', nullable: true })
  attachments?: {
    id: string;
    filename: string;
    originalName: string;
    path: string;
    fileSize: number;
    mimeType: string;
    category?: string; // instruction, reference, drawing, photo, result, safety, etc.
    description?: string;
    uploadedAt: Date;
    uploadedBy: string;
    tags?: string[];
  }[];

  // Tags để phân loại
  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  // Metadata cho nội dung phong phú (đơn giản hóa)
  @Column({ type: 'jsonb', nullable: true })
  richContent?: {
    images?: string[]; // File IDs từ file manager
    documents?: string[]; // File IDs từ file manager
    drawings?: string[]; // File IDs từ file manager
    videos?: string[]; // File IDs hoặc URLs
    relatedLinks?: string[]; // Các link liên quan
  };

  @Column({ type: 'text', nullable: true })
  safetyInstructions?: string; // Hướng dẫn an toàn

  @Column({ type: 'text', nullable: true })
  toolsRequired?: string; // Dụng cụ cần thiết

  @Column({ type: 'text', nullable: true })
  expectedOutcome?: string; // Kết quả mong đợi
}
