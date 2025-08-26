import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  JigOrder,
  JigOrderDetail,
  JigOrderStatus,
  JigOrderPriority,
} from './entities/jig-order.entity';
import { JigDetail, JigStatus } from './entities/jig-detail.entity';
import { User } from 'src/user/entities/user.entity';
import { Location } from 'src/meta/entities/location.entity';
import { Line } from 'src/meta/entities/line.entity';
import {
  InOutHistory,
  InOutType,
} from 'src/meta/entities/inout-history.entity';
import { ApprovalRequestService } from 'src/approval/services/approval-request.service';
import { NotificationService } from 'src/notification/notification.service';
import {
  CreateJigOrderDto,
  UpdateJigOrderDto,
  JigOrderQueryDto,
  ApproveJigOrderDto,
  RejectJigOrderDto,
  PrepareJigOrderDto,
  NotifyJigOrderDto,
  PickupJigOrderDto,
} from './dto/jig-order.dto';
import { PaginatedResult } from 'src/common/dto/paginated-result.dto';
import { ApprovalPriority } from 'src/approval/enums';

@Injectable()
export class JigOrderService {
  constructor(
    @InjectRepository(JigOrder)
    private readonly jigOrderRepository: Repository<JigOrder>,
    @InjectRepository(JigOrderDetail)
    private readonly jigOrderDetailRepository: Repository<JigOrderDetail>,
    @InjectRepository(JigDetail)
    private readonly jigDetailRepository: Repository<JigDetail>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Line)
    private readonly lineRepository: Repository<Line>,
    @InjectRepository(InOutHistory)
    private readonly inOutHistoryRepository: Repository<InOutHistory>,
    private readonly dataSource: DataSource,
    private readonly approvalRequestService: ApprovalRequestService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    createDto: CreateJigOrderDto,
    requesterId: string,
  ): Promise<JigOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tạo mã đơn hàng tự động
      const orderCode = await this.generateOrderCode();

      // Kiểm tra requester
      const requester = await this.userRepository.findOne({
        where: { id: requesterId },
      });
      if (!requester) {
        throw new NotFoundException('Không tìm thấy người yêu cầu');
      }

      // Kiểm tra delivery location/line
      let deliveryLocation: Location | undefined = undefined;
      let deliveryLine: Line | undefined = undefined;

      if (createDto.deliveryLocationId) {
        const location = await this.locationRepository.findOne({
          where: { id: createDto.deliveryLocationId },
        });
        if (!location) {
          throw new NotFoundException('Không tìm thấy vị trí giao hàng');
        }
        deliveryLocation = location;
      }

      if (createDto.deliveryLineId) {
        const line = await this.lineRepository.findOne({
          where: { id: createDto.deliveryLineId },
        });
        if (!line) {
          throw new NotFoundException('Không tìm thấy line giao hàng');
        }
        deliveryLine = line;
      }

      // Tạo order
      const order = queryRunner.manager.create(JigOrder, {
        orderCode,
        title: createDto.title,
        description: createDto.description,
        priority: createDto.priority,
        requestedDate: createDto.requestedDate
          ? new Date(createDto.requestedDate)
          : new Date(),
        requiredDate: new Date(createDto.requiredDate),
        status: JigOrderStatus.DRAFT,
        requester,
        deliveryLocation,
        deliveryLine,
        metadata: createDto.metadata,
      });

      const savedOrder = await queryRunner.manager.save(JigOrder, order);

      // Tạo order details
      for (const detailDto of createDto.orderDetails) {
        const jigDetail = await this.jigDetailRepository.findOne({
          where: { id: detailDto.jigDetailId },
          relations: ['jig'],
        });

        if (!jigDetail) {
          throw new NotFoundException(
            `Không tìm thấy jig detail với ID ${detailDto.jigDetailId}`,
          );
        }

        // Kiểm tra availability
        if (jigDetail.status === JigStatus.SCRAP) {
          throw new BadRequestException(
            `Jig detail ${jigDetail.code} đã bị hủy, không thể order`,
          );
        }

        const orderDetail = queryRunner.manager.create(JigOrderDetail, {
          order: savedOrder,
          jigDetail,
          quantity: detailDto.quantity,
          notes: detailDto.notes,
        });

        await queryRunner.manager.save(orderDetail);
      }

      await queryRunner.commitTransaction();

      // Load đầy đủ thông tin order
      const result = await this.findOne(savedOrder.id);

      // Gửi notification
      await this.notificationService.sendToPermission(
        'JIG_ORDER_VIEW' as any,
        'jig-order-created',
        {
          orderId: result.id,
          orderCode: result.orderCode,
          title: result.title,
          requester: result.requester.username,
          priority: result.priority,
        },
      );

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: JigOrderQueryDto): Promise<PaginatedResult<JigOrder>> {
    const queryBuilder = this.jigOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.requester', 'requester')
      .leftJoinAndSelect('order.approver', 'approver')
      .leftJoinAndSelect('order.preparer', 'preparer')
      .leftJoinAndSelect('order.receiver', 'receiver')
      .leftJoinAndSelect('order.deliveryLocation', 'deliveryLocation')
      .leftJoinAndSelect('order.deliveryLine', 'deliveryLine')
      .leftJoinAndSelect('order.orderDetails', 'orderDetails')
      .leftJoinAndSelect('orderDetails.jigDetail', 'jigDetail')
      .leftJoinAndSelect('jigDetail.jig', 'jig');

    // Apply filters
    if (query.search) {
      queryBuilder.andWhere(
        '(order.title ILIKE :search OR order.description ILIKE :search OR order.orderCode ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      queryBuilder.andWhere('order.status = :status', { status: query.status });
    }

    if (query.priority) {
      queryBuilder.andWhere('order.priority = :priority', {
        priority: query.priority,
      });
    }

    if (query.requesterId) {
      queryBuilder.andWhere('order.requester.id = :requesterId', {
        requesterId: query.requesterId,
      });
    }

    if (query.approverId) {
      queryBuilder.andWhere('order.approver.id = :approverId', {
        approverId: query.approverId,
      });
    }

    if (query.fromDate) {
      queryBuilder.andWhere('order.createdAt >= :fromDate', {
        fromDate: query.fromDate,
      });
    }

    if (query.toDate) {
      queryBuilder.andWhere('order.createdAt <= :toDate', {
        toDate: query.toDate,
      });
    }

    // Sorting
    queryBuilder.orderBy(`order.${query.sortBy}`, query.sortOrder);

    // Pagination
    const total = await queryBuilder.getCount();
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<JigOrder> {
    const order = await this.jigOrderRepository.findOne({
      where: { id },
      relations: [
        'requester',
        'approver',
        'preparer',
        'receiver',
        'deliveryLocation',
        'deliveryLine',
        'orderDetails',
        'orderDetails.jigDetail',
        'orderDetails.jigDetail.jig',
        'orderDetails.jigDetail.location',
        'orderDetails.jigDetail.line',
        'orderDetails.jigDetail.vendor',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID ${id}`);
    }

    return order;
  }

  async update(
    id: string,
    updateDto: UpdateJigOrderDto,
    userId: string,
  ): Promise<JigOrder> {
    const order = await this.findOne(id);

    // Chỉ cho phép cập nhật khi ở trạng thái DRAFT hoặc là người tạo
    if (
      order.status !== JigOrderStatus.DRAFT &&
      order.requester.id !== userId
    ) {
      throw new ForbiddenException('Không thể cập nhật đơn hàng này');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update basic fields
      Object.assign(order, {
        title: updateDto.title ?? order.title,
        description: updateDto.description ?? order.description,
        priority: updateDto.priority ?? order.priority,
        requestedDate: updateDto.requestedDate
          ? new Date(updateDto.requestedDate)
          : order.requestedDate,
        requiredDate: updateDto.requiredDate
          ? new Date(updateDto.requiredDate)
          : order.requiredDate,
        metadata: updateDto.metadata ?? order.metadata,
      });

      // Update delivery location/line
      if (updateDto.deliveryLocationId !== undefined) {
        if (updateDto.deliveryLocationId) {
          const location = await this.locationRepository.findOne({
            where: { id: updateDto.deliveryLocationId },
          });
          if (!location) {
            throw new NotFoundException('Không tìm thấy vị trí giao hàng');
          }
          order.deliveryLocation = location;
        } else {
          order.deliveryLocation = undefined;
        }
      }

      if (updateDto.deliveryLineId !== undefined) {
        if (updateDto.deliveryLineId) {
          const line = await this.lineRepository.findOne({
            where: { id: updateDto.deliveryLineId },
          });
          if (!line) {
            throw new NotFoundException('Không tìm thấy line giao hàng');
          }
          order.deliveryLine = line;
        } else {
          order.deliveryLine = undefined;
        }
      }

      await queryRunner.manager.save(order);

      // Update order details if provided
      if (updateDto.orderDetails) {
        // Xóa các order details cũ
        await queryRunner.manager.delete(JigOrderDetail, {
          order: { id: order.id },
        });

        // Tạo order details mới
        for (const detailDto of updateDto.orderDetails) {
          const jigDetail = await this.jigDetailRepository.findOne({
            where: { id: detailDto.jigDetailId },
            relations: ['jig'],
          });

          if (!jigDetail) {
            throw new NotFoundException(
              `Không tìm thấy jig detail với ID ${detailDto.jigDetailId}`,
            );
          }

          const orderDetail = queryRunner.manager.create(JigOrderDetail, {
            order,
            jigDetail,
            quantity: detailDto.quantity,
            notes: detailDto.notes,
          });

          await queryRunner.manager.save(orderDetail);
        }
      }

      await queryRunner.commitTransaction();

      return await this.findOne(order.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async submit(id: string, userId: string): Promise<JigOrder> {
    const order = await this.findOne(id);

    if (order.requester.id !== userId) {
      throw new ForbiddenException('Chỉ người tạo mới có thể submit đơn hàng');
    }

    if (order.status !== JigOrderStatus.DRAFT) {
      throw new BadRequestException(
        'Chỉ có thể submit đơn hàng ở trạng thái DRAFT',
      );
    }

    // Kiểm tra order details
    if (!order.orderDetails || order.orderDetails.length === 0) {
      throw new BadRequestException('Đơn hàng phải có ít nhất 1 jig detail');
    }

    // Cập nhật trạng thái
    order.status = JigOrderStatus.SUBMITTED;
    await this.jigOrderRepository.save(order);

    // Tạo approval request
    const approvalPriority = this.mapOrderPriorityToApprovalPriority(
      order.priority,
    );

    const approvalRequest = await this.approvalRequestService.create(
      {
        workflowCode: 'JIG_ORDER_APPROVAL',
        title: `Phê duyệt đơn hàng Jig: ${order.title}`,
        description: `Yêu cầu phê duyệt đơn hàng jig ${order.orderCode}`,
        entityType: 'jig-order',
        entityId: order.id,
        priority: approvalPriority,
      },
      userId,
    );

    // Lưu approval request ID
    order.approvalRequestId = approvalRequest.id;
    await this.jigOrderRepository.save(order);

    // Gửi notification
    await this.notificationService.sendToPermission(
      'JIG_ORDER_APPROVE' as any,
      'jig-order-submitted',
      {
        orderId: order.id,
        orderCode: order.orderCode,
        title: order.title,
        requester: order.requester.username,
        priority: order.priority,
        approvalRequestId: approvalRequest.id,
      },
    );

    return await this.findOne(order.id);
  }

  async approve(
    id: string,
    approveDto: ApproveJigOrderDto,
    approverId: string,
  ): Promise<JigOrder> {
    const order = await this.findOne(id);

    if (order.status !== JigOrderStatus.SUBMITTED) {
      throw new BadRequestException(
        'Chỉ có thể phê duyệt đơn hàng ở trạng thái SUBMITTED',
      );
    }

    const approver = await this.userRepository.findOne({
      where: { id: approverId },
    });
    if (!approver) {
      throw new NotFoundException('Không tìm thấy người phê duyệt');
    }

    // Cập nhật trạng thái
    order.status = JigOrderStatus.APPROVED;
    order.approver = approver;
    order.approvedDate = new Date();
    if (approveDto.notes) {
      order.metadata = { ...order.metadata, approvalNotes: approveDto.notes };
    }

    await this.jigOrderRepository.save(order);

    // Gửi notification cho requester
    await this.notificationService.sendToUser(
      order.requester.id,
      'jig-order-approved',
      {
        orderId: order.id,
        orderCode: order.orderCode,
        title: order.title,
        approver: approver.username,
        approvedDate: order.approvedDate,
      },
    );

    // Gửi notification cho warehouse team
    await this.notificationService.sendToPermission(
      'JIG_ORDER_PREPARE' as any,
      'jig-order-need-preparation',
      {
        orderId: order.id,
        orderCode: order.orderCode,
        title: order.title,
        requester: order.requester.username,
        priority: order.priority,
      },
    );

    return await this.findOne(order.id);
  }

  async reject(
    id: string,
    rejectDto: RejectJigOrderDto,
    approverId: string,
  ): Promise<JigOrder> {
    const order = await this.findOne(id);

    if (order.status !== JigOrderStatus.SUBMITTED) {
      throw new BadRequestException(
        'Chỉ có thể từ chối đơn hàng ở trạng thái SUBMITTED',
      );
    }

    const approver = await this.userRepository.findOne({
      where: { id: approverId },
    });
    if (!approver) {
      throw new NotFoundException('Không tìm thấy người phê duyệt');
    }

    // Cập nhật trạng thái
    order.status = JigOrderStatus.REJECTED;
    order.approver = approver;
    order.rejectionReason = rejectDto.rejectionReason;

    await this.jigOrderRepository.save(order);

    // Gửi notification cho requester
    await this.notificationService.sendToUser(
      order.requester.id,
      'jig-order-rejected',
      {
        orderId: order.id,
        orderCode: order.orderCode,
        title: order.title,
        approver: approver.username,
        rejectionReason: rejectDto.rejectionReason,
      },
    );

    return await this.findOne(order.id);
  }

  async prepare(
    id: string,
    prepareDto: PrepareJigOrderDto,
    preparerId: string,
  ): Promise<JigOrder> {
    const order = await this.findOne(id);

    if (order.status !== JigOrderStatus.APPROVED) {
      throw new BadRequestException(
        'Chỉ có thể chuẩn bị đơn hàng đã được phê duyệt',
      );
    }

    const preparer = await this.userRepository.findOne({
      where: { id: preparerId },
    });
    if (!preparer) {
      throw new NotFoundException('Không tìm thấy người chuẩn bị');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Cập nhật trạng thái order
      order.status = JigOrderStatus.PREPARING;
      order.preparer = preparer;
      order.preparationNotes = prepareDto.preparationNotes;
      await queryRunner.manager.save(order);

      // Cập nhật chi tiết chuẩn bị
      for (const preparedDetail of prepareDto.preparedDetails) {
        const orderDetail = await this.jigOrderDetailRepository.findOne({
          where: { id: preparedDetail.orderDetailId },
          relations: ['jigDetail'],
        });

        if (!orderDetail) {
          throw new NotFoundException(
            `Không tìm thấy order detail với ID ${preparedDetail.orderDetailId}`,
          );
        }

        orderDetail.isPrepared = true;
        orderDetail.preparedDate = new Date();
        orderDetail.actualQuantity = preparedDetail.actualQuantity;
        if (preparedDetail.notes) {
          orderDetail.notes = preparedDetail.notes;
        }

        await queryRunner.manager.save(orderDetail);

        // Tạo inout history cho jig detail
        const inOutHistory = queryRunner.manager.create(InOutHistory, {
          jigDetail: orderDetail.jigDetail,
          quantity: preparedDetail.actualQuantity,
          type: InOutType.OUT,
          description: `Xuất jig cho đơn hàng ${order.orderCode}`,
        });

        await queryRunner.manager.save(inOutHistory);

        // Cập nhật trạng thái jig detail
        if (orderDetail.jigDetail.status === JigStatus.STORAGE) {
          orderDetail.jigDetail.status = JigStatus.LINE; // Temporarily moved to prepare for delivery
          await queryRunner.manager.save(orderDetail.jigDetail);
        }
      }

      // Kiểm tra xem tất cả đã được chuẩn bị chưa
      const allPrepared = order.orderDetails.every(
        (detail) => detail.isPrepared,
      );
      if (allPrepared) {
        order.status = JigOrderStatus.READY;
        order.preparedDate = new Date();
        await queryRunner.manager.save(order);
      }

      await queryRunner.commitTransaction();

      // Gửi notification
      if (allPrepared) {
        await this.notificationService.sendToUser(
          order.requester.id,
          'jig-order-ready',
          {
            orderId: order.id,
            orderCode: order.orderCode,
            title: order.title,
            preparer: preparer.username,
            preparedDate: order.preparedDate,
          },
        );
      } else {
        await this.notificationService.sendToUser(
          order.requester.id,
          'jig-order-partially-prepared',
          {
            orderId: order.id,
            orderCode: order.orderCode,
            title: order.title,
            preparer: preparer.username,
          },
        );
      }

      return await this.findOne(order.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async notify(
    id: string,
    notifyDto: NotifyJigOrderDto,
    notifierId: string,
  ): Promise<JigOrder> {
    const order = await this.findOne(id);

    if (order.status !== JigOrderStatus.READY) {
      throw new BadRequestException(
        'Chỉ có thể thông báo đơn hàng đã sẵn sàng',
      );
    }

    // Cập nhật trạng thái
    order.status = JigOrderStatus.NOTIFIED;
    order.notifiedDate = new Date();
    if (notifyDto.notificationMessage) {
      order.metadata = {
        ...order.metadata,
        notificationMessage: notifyDto.notificationMessage,
      };
    }

    await this.jigOrderRepository.save(order);

    // Gửi notification đến requester
    await this.notificationService.sendToUser(
      order.requester.id,
      'jig-order-ready-for-pickup',
      {
        orderId: order.id,
        orderCode: order.orderCode,
        title: order.title,
        deliveryLocation: order.deliveryLocation?.name,
        deliveryLine: order.deliveryLine?.name,
        customMessage: notifyDto.notificationMessage,
        notifiedDate: order.notifiedDate,
      },
    );

    return await this.findOne(order.id);
  }

  async pickup(
    id: string,
    pickupDto: PickupJigOrderDto,
    pickupUserId: string,
  ): Promise<JigOrder> {
    const order = await this.findOne(id);

    if (order.status !== JigOrderStatus.NOTIFIED) {
      throw new BadRequestException(
        'Chỉ có thể pickup đơn hàng đã được thông báo',
      );
    }

    // Kiểm tra quyền pickup (chỉ requester hoặc người được ủy quyền)
    const actualReceiver = pickupDto.actualReceiverId
      ? await this.userRepository.findOne({
          where: { id: pickupDto.actualReceiverId },
        })
      : await this.userRepository.findOne({ where: { id: pickupUserId } });

    if (!actualReceiver) {
      throw new NotFoundException('Không tìm thấy người nhận');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Cập nhật trạng thái order
      order.status = JigOrderStatus.PICKED_UP;
      order.receiver = actualReceiver;
      order.pickedUpDate = new Date();
      order.completedDate = new Date();
      order.deliveryNotes = pickupDto.deliveryNotes;

      await queryRunner.manager.save(order);

      // Cập nhật trạng thái jig detail và tạo inout history
      for (const orderDetail of order.orderDetails) {
        // Tạo inout history cho việc nhận jig
        const inOutHistory = queryRunner.manager.create(InOutHistory, {
          jigDetail: orderDetail.jigDetail,
          quantity: orderDetail.actualQuantity || orderDetail.quantity,
          type: InOutType.IN,
          description: `Nhận jig từ đơn hàng ${order.orderCode} bởi ${actualReceiver.username}`,
        });

        await queryRunner.manager.save(inOutHistory);

        // Cập nhật location/line của jig detail theo delivery location
        if (order.deliveryLocation) {
          orderDetail.jigDetail.location = order.deliveryLocation;
          orderDetail.jigDetail.line = undefined;
          orderDetail.jigDetail.vendor = undefined;
          orderDetail.jigDetail.status = JigStatus.STORAGE;
        } else if (order.deliveryLine) {
          orderDetail.jigDetail.line = order.deliveryLine;
          orderDetail.jigDetail.location = undefined;
          orderDetail.jigDetail.vendor = undefined;
          orderDetail.jigDetail.status = JigStatus.LINE;
        } else {
          // Nếu không có delivery location/line, giữ nguyên trạng thái hiện tại
          orderDetail.jigDetail.status = JigStatus.STORAGE;
        }

        await queryRunner.manager.save(orderDetail.jigDetail);
      }

      await queryRunner.commitTransaction();

      // Gửi notification hoàn thành
      await this.notificationService.sendToPermission(
        'JIG_ORDER_VIEW' as any,
        'jig-order-completed',
        {
          orderId: order.id,
          orderCode: order.orderCode,
          title: order.title,
          requester: order.requester.username,
          receiver: actualReceiver.username,
          completedDate: order.completedDate,
        },
      );

      return await this.findOne(order.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: string, reason: string, userId: string): Promise<JigOrder> {
    const order = await this.findOne(id);

    // Chỉ cho phép cancel ở một số trạng thái nhất định
    const allowedStatuses = [
      JigOrderStatus.DRAFT,
      JigOrderStatus.SUBMITTED,
      JigOrderStatus.APPROVED,
      JigOrderStatus.PREPARING,
    ];

    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException('Không thể hủy đơn hàng ở trạng thái này');
    }

    // Kiểm tra quyền cancel (requester hoặc có permission cao hơn)
    if (order.requester.id !== userId) {
      // TODO: Kiểm tra permission ADMIN hoặc JIG_ORDER_ADMIN
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const previousStatus = order.status;

      // Cập nhật trạng thái order
      order.status = JigOrderStatus.CANCELLED;
      order.rejectionReason = reason;

      await queryRunner.manager.save(order);

      // Nếu order đã ở trạng thái PREPARING, cần hoàn nguyên trạng thái jig detail
      if (previousStatus === JigOrderStatus.PREPARING) {
        for (const orderDetail of order.orderDetails) {
          if (orderDetail.isPrepared) {
            // Tạo inout history để hoàn nguyên
            const inOutHistory = queryRunner.manager.create(InOutHistory, {
              jigDetail: orderDetail.jigDetail,
              quantity: orderDetail.actualQuantity || orderDetail.quantity,
              type: InOutType.IN,
              description: `Hoàn nguyên jig do hủy đơn hàng ${order.orderCode}`,
            });

            await queryRunner.manager.save(inOutHistory);

            // Hoàn nguyên trạng thái jig detail
            orderDetail.jigDetail.status = JigStatus.STORAGE;
            await queryRunner.manager.save(orderDetail.jigDetail);
          }
        }
      }

      await queryRunner.commitTransaction();

      // Gửi notification
      await this.notificationService.sendToUser(
        order.requester.id,
        'jig-order-cancelled',
        {
          orderId: order.id,
          orderCode: order.orderCode,
          title: order.title,
          reason: reason,
        },
      );

      return await this.findOne(order.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyOrders(
    userId: string,
    query: JigOrderQueryDto,
  ): Promise<PaginatedResult<JigOrder>> {
    query.requesterId = userId;
    return await this.findAll(query);
  }

  async getPendingApprovals(
    query: JigOrderQueryDto,
  ): Promise<PaginatedResult<JigOrder>> {
    query.status = JigOrderStatus.SUBMITTED;
    return await this.findAll(query);
  }

  async getPendingPreparations(
    query: JigOrderQueryDto,
  ): Promise<PaginatedResult<JigOrder>> {
    const modifiedQuery = { ...query };
    // Lấy đơn hàng đã approved hoặc đang preparing
    const queryBuilder = this.jigOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.requester', 'requester')
      .leftJoinAndSelect('order.approver', 'approver')
      .leftJoinAndSelect('order.preparer', 'preparer')
      .leftJoinAndSelect('order.receiver', 'receiver')
      .leftJoinAndSelect('order.deliveryLocation', 'deliveryLocation')
      .leftJoinAndSelect('order.deliveryLine', 'deliveryLine')
      .leftJoinAndSelect('order.orderDetails', 'orderDetails')
      .leftJoinAndSelect('orderDetails.jigDetail', 'jigDetail')
      .leftJoinAndSelect('jigDetail.jig', 'jig')
      .where('order.status IN (:...statuses)', {
        statuses: [JigOrderStatus.APPROVED, JigOrderStatus.PREPARING],
      });

    // Apply other filters...
    if (modifiedQuery.search) {
      queryBuilder.andWhere(
        '(order.title ILIKE :search OR order.description ILIKE :search OR order.orderCode ILIKE :search)',
        { search: `%${modifiedQuery.search}%` },
      );
    }

    if (modifiedQuery.priority) {
      queryBuilder.andWhere('order.priority = :priority', {
        priority: modifiedQuery.priority,
      });
    }

    // Sorting
    queryBuilder.orderBy(
      `order.${modifiedQuery.sortBy}`,
      modifiedQuery.sortOrder,
    );

    // Pagination
    const total = await queryBuilder.getCount();
    const page = modifiedQuery.page || 1;
    const limit = modifiedQuery.limit || 10;
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async getOrderStatistics(): Promise<any> {
    const stats = await this.jigOrderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('order.status')
      .getRawMany();

    const priorityStats = await this.jigOrderRepository
      .createQueryBuilder('order')
      .select('order.priority', 'priority')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('order.priority')
      .getRawMany();

    return {
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {}),
      byPriority: priorityStats.reduce((acc, stat) => {
        acc[stat.priority] = parseInt(stat.count);
        return acc;
      }, {}),
    };
  }

  private async generateOrderCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `JO${year}${month}${day}`;

    // Tìm số thứ tự tiếp theo
    const lastOrder = await this.jigOrderRepository
      .createQueryBuilder('order')
      .where('order.orderCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('order.orderCode', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(
        lastOrder.orderCode.substring(prefix.length),
      );
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  private mapOrderPriorityToApprovalPriority(
    priority: JigOrderPriority,
  ): ApprovalPriority {
    switch (priority) {
      case JigOrderPriority.URGENT:
        return ApprovalPriority.HIGH;
      case JigOrderPriority.HIGH:
        return ApprovalPriority.NORMAL;
      case JigOrderPriority.NORMAL:
        return ApprovalPriority.LOW;
      case JigOrderPriority.LOW:
        return ApprovalPriority.LOW;
      default:
        return ApprovalPriority.NORMAL;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const order = await this.findOne(id);

    // Chỉ cho phép xóa khi ở trạng thái DRAFT hoặc REJECTED và là người tạo
    if (
      ![JigOrderStatus.DRAFT, JigOrderStatus.REJECTED].includes(order.status) ||
      order.requester.id !== userId
    ) {
      throw new ForbiddenException('Không thể xóa đơn hàng này');
    }

    await this.jigOrderRepository.remove(order);
  }
}
