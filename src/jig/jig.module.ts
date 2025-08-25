import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JigService } from './jig.service';
import { JigController } from './jig.controller';
import { JigDetailService } from './jig-detail.service';
import { JigDetailController } from './jig-detail.controller';
import { JigDrawingService } from './jig-drawing.service';
import { JigDrawingController } from './jig-drawing.controller';
import { JigOrderService } from './jig-order.service';
import { JigOrderController } from './jig-order.controller';
import { JigOrderNotificationListener } from './jig-order-notification.listener';
import { Jig } from './entities/jig.entity';
import { JigDetail } from './entities/jig-detail.entity';
import { JigDrawing } from './entities/jig-drawing.entity';
import { JigOrder, JigOrderDetail } from './entities/jig-order.entity';
import { UserModule } from '../user/user.module';
import { ApprovalModule } from '../approval/approval.module';
import { NotificationModule } from '../notification/notification.module';
import { User } from 'src/user/entities/user.entity';
import { Location } from 'src/meta/entities/location.entity';
import { Line } from 'src/meta/entities/line.entity';
import { InOutHistory } from 'src/meta/entities/inout-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Jig, 
      JigDetail, 
      JigDrawing, 
      JigOrder, 
      JigOrderDetail,
      User,
      Location,
      Line,
      InOutHistory
    ]),
    UserModule,
    ApprovalModule,
    NotificationModule
  ],
  controllers: [
    JigController, 
    JigDetailController, 
    JigDrawingController,
    JigOrderController
  ],
  providers: [
    JigService, 
    JigDetailService, 
    JigDrawingService,
    JigOrderService,
    JigOrderNotificationListener
  ],
  exports: [
    JigService, 
    JigDetailService, 
    JigDrawingService,
    JigOrderService
  ],
})
export class JigModule {}
