import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JigOrderService } from '../jig/jig-order.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class JigOrderNotificationListener {
  constructor(
    private readonly jigOrderService: JigOrderService,
    private readonly notificationService: NotificationService,
  ) {}

  @OnEvent('approval.request.approved')
  async handleApprovalApproved(payload: any) {
    if (payload.entityType === 'jig-order') {
      try {
        // Tự động approve order khi approval request được approve
        const order = await this.jigOrderService.findOne(payload.entityId);
        if (order && order.status === 'submitted') {
          await this.jigOrderService.approve(
            payload.entityId,
            { notes: 'Tự động phê duyệt từ hệ thống approval' },
            payload.approverId,
          );
        }
      } catch (error) {
        console.error('Error auto-approving jig order:', error);
      }
    }
  }

  @OnEvent('approval.request.rejected')
  async handleApprovalRejected(payload: any) {
    if (payload.entityType === 'jig-order') {
      try {
        // Tự động reject order khi approval request bị reject
        const order = await this.jigOrderService.findOne(payload.entityId);
        if (order && order.status === 'submitted') {
          await this.jigOrderService.reject(
            payload.entityId,
            {
              rejectionReason:
                payload.comments || 'Từ chối từ hệ thống approval',
            },
            payload.approverId,
          );
        }
      } catch (error) {
        console.error('Error auto-rejecting jig order:', error);
      }
    }
  }
}
