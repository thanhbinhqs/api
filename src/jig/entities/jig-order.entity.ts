import { BaseEntity } from 'src/common/entities/base-entity';
import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { JigDetail } from './jig-detail.entity';
import { User } from 'src/user/entities/user.entity';
import { Location } from 'src/meta/entities/location.entity';
import { Line } from 'src/meta/entities/line.entity';
import { Vendor } from 'src/meta/entities/vendor.entity';

export enum JigOrderStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PREPARING = 'preparing',
  READY = 'ready',
  NOTIFIED = 'notified',
  PICKED_UP = 'picked_up',
  CANCELLED = 'cancelled',
}

export enum JigOrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('jig-orders')
export class JigOrder extends BaseEntity {
  @Column({ unique: true })
  orderCode: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: JigOrderStatus,
    default: JigOrderStatus.DRAFT,
  })
  status: JigOrderStatus;

  @Column({
    type: 'enum',
    enum: JigOrderPriority,
    default: JigOrderPriority.NORMAL,
  })
  priority: JigOrderPriority;

  @Column({ nullable: true })
  requestedDate?: Date;

  @Column({ nullable: true })
  requiredDate?: Date;

  @Column({ nullable: true })
  approvedDate?: Date;

  @Column({ nullable: true })
  preparedDate?: Date;

  @Column({ nullable: true })
  notifiedDate?: Date;

  @Column({ nullable: true })
  pickedUpDate?: Date;

  @Column({ nullable: true })
  completedDate?: Date;

  // Người yêu cầu
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  // Người phê duyệt
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approver_id' })
  approver?: User;

  // Người chuẩn bị
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'preparer_id' })
  preparer?: User;

  // Người nhận
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'receiver_id' })
  receiver?: User;

  // Vị trí giao hàng
  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'delivery_location_id' })
  deliveryLocation?: Location;

  @ManyToOne(() => Line, { nullable: true })
  @JoinColumn({ name: 'delivery_line_id' })
  deliveryLine?: Line;

  // Chi tiết các jig trong order
  @OneToMany(() => JigOrderDetail, (orderDetail) => orderDetail.order, {
    cascade: true,
  })
  orderDetails: JigOrderDetail[];

  @Column({ nullable: true })
  approvalRequestId?: string; // Link to approval system

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ nullable: true })
  preparationNotes?: string;

  @Column({ nullable: true })
  deliveryNotes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}

@Entity('jig-order-details')
export class JigOrderDetail extends BaseEntity {
  @ManyToOne(() => JigOrder, (order) => order.orderDetails, { nullable: false })
  @JoinColumn({ name: 'order_id' })
  order: JigOrder;

  @ManyToOne(() => JigDetail, { nullable: false })
  @JoinColumn({ name: 'jig_detail_id' })
  jigDetail: JigDetail;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  notes?: string;

  @Column({ default: false })
  isPrepared: boolean;

  @Column({ nullable: true })
  preparedDate?: Date;

  @Column({ nullable: true })
  actualQuantity?: number; // Số lượng thực tế chuẩn bị được
}
