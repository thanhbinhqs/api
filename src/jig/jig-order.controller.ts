import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JigOrderService } from './jig-order.service';
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
import { JigOrder } from './entities/jig-order.entity';
import { PaginatedResult } from 'src/common/dto/paginated-result.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';

@ApiTags('Jig Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jig-orders')
export class JigOrderController {
  constructor(private readonly jigOrderService: JigOrderService) {}

  @Post()
  @HasPermission(Permission.JIG_ORDER_CREATE)
  @ApiOperation({ summary: 'Tạo đơn hàng jig mới' })
  @ApiResponse({
    status: 201,
    description: 'Đơn hàng đã được tạo thành công',
    type: JigOrder,
  })
  async create(
    @Body() createJigOrderDto: CreateJigOrderDto,
    @CurrentUser() user: User,
  ): Promise<JigOrder> {
    return await this.jigOrderService.create(createJigOrderDto, user.id);
  }

  @Get()
  @HasPermission(Permission.JIG_ORDER_READ)
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng jig' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng jig',
    type: PaginatedResult,
  })
  async findAll(
    @Query() query: JigOrderQueryDto,
  ): Promise<PaginatedResult<JigOrder>> {
    return await this.jigOrderService.findAll(query);
  }

  @Get('my-orders')
  @HasPermission(Permission.JIG_ORDER_READ)
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của tôi' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng của tôi',
    type: PaginatedResult,
  })
  async getMyOrders(
    @Query() query: JigOrderQueryDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedResult<JigOrder>> {
    return await this.jigOrderService.getMyOrders(user.id, query);
  }

  @Get('pending-approvals')
  @HasPermission(Permission.JIG_ORDER_APPROVE)
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng chờ phê duyệt' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng chờ phê duyệt',
    type: PaginatedResult,
  })
  async getPendingApprovals(
    @Query() query: JigOrderQueryDto,
  ): Promise<PaginatedResult<JigOrder>> {
    return await this.jigOrderService.getPendingApprovals(query);
  }

  @Get('pending-preparations')
  @HasPermission(Permission.JIG_ORDER_PREPARE)
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng chờ chuẩn bị' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng chờ chuẩn bị',
    type: PaginatedResult,
  })
  async getPendingPreparations(
    @Query() query: JigOrderQueryDto,
  ): Promise<PaginatedResult<JigOrder>> {
    return await this.jigOrderService.getPendingPreparations(query);
  }

  @Get('statistics')
  @HasPermission(Permission.JIG_ORDER_READ)
  @ApiOperation({ summary: 'Lấy thống kê đơn hàng jig' })
  @ApiResponse({ status: 200, description: 'Thống kê đơn hàng jig' })
  async getStatistics(): Promise<any> {
    return await this.jigOrderService.getOrderStatistics();
  }

  @Get(':id')
  @HasPermission(Permission.JIG_ORDER_READ)
  @ApiOperation({ summary: 'Lấy thông tin đơn hàng jig theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin đơn hàng jig',
    type: JigOrder,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<JigOrder> {
    return await this.jigOrderService.findOne(id);
  }

  @Patch(':id')
  @HasPermission(Permission.JIG_ORDER_UPDATE)
  @ApiOperation({ summary: 'Cập nhật đơn hàng jig' })
  @ApiResponse({
    status: 200,
    description: 'Đơn hàng đã được cập nhật',
    type: JigOrder,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJigOrderDto: UpdateJigOrderDto,
    @CurrentUser() user: User,
  ): Promise<JigOrder> {
    return await this.jigOrderService.update(id, updateJigOrderDto, user.id);
  }

  @Post(':id/submit')
  @HasPermission(Permission.JIG_ORDER_CREATE)
  @ApiOperation({ summary: 'Submit đơn hàng để chờ phê duyệt' })
  @ApiResponse({
    status: 200,
    description: 'Đơn hàng đã được submit',
    type: JigOrder,
  })
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<JigOrder> {
    return await this.jigOrderService.submit(id, user.id);
  }

  @Post(':id/approve')
  @HasPermission(Permission.JIG_ORDER_APPROVE)
  @ApiOperation({ summary: 'Phê duyệt đơn hàng jig' })
  @ApiResponse({
    status: 200,
    description: 'Đơn hàng đã được phê duyệt',
    type: JigOrder,
  })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approveDto: ApproveJigOrderDto,
    @CurrentUser() user: User,
  ): Promise<JigOrder> {
    return await this.jigOrderService.approve(id, approveDto, user.id);
  }

  @Post(':id/reject')
  @HasPermission(Permission.JIG_ORDER_APPROVE)
  @ApiOperation({ summary: 'Từ chối đơn hàng jig' })
  @ApiResponse({
    status: 200,
    description: 'Đơn hàng đã được từ chối',
    type: JigOrder,
  })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rejectDto: RejectJigOrderDto,
    @CurrentUser() user: User,
  ): Promise<JigOrder> {
    return await this.jigOrderService.reject(id, rejectDto, user.id);
  }

  @Post(':id/prepare')
  @HasPermission(Permission.JIG_ORDER_PREPARE)
  @ApiOperation({ summary: 'Chuẩn bị đơn hàng jig' })
  @ApiResponse({
    status: 200,
    description: 'Đơn hàng đã được chuẩn bị',
    type: JigOrder,
  })
  async prepare(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() prepareDto: PrepareJigOrderDto,
    @CurrentUser() user: User,
  ): Promise<JigOrder> {
    return await this.jigOrderService.prepare(id, prepareDto, user.id);
  }

  @Post(':id/notify')
  @HasPermission(Permission.JIG_ORDER_PREPARE)
  @ApiOperation({ summary: 'Thông báo đơn hàng đã sẵn sàng' })
  @ApiResponse({
    status: 200,
    description: 'Đã thông báo đơn hàng sẵn sàng',
    type: JigOrder,
  })
  async notify(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() notifyDto: NotifyJigOrderDto,
    @CurrentUser() user: User,
  ): Promise<JigOrder> {
    return await this.jigOrderService.notify(id, notifyDto, user.id);
  }

  @Post(':id/pickup')
  @HasPermission(Permission.JIG_ORDER_PICKUP)
  @ApiOperation({ summary: 'Lấy jig từ đơn hàng' })
  @ApiResponse({
    status: 200,
    description: 'Đã lấy jig thành công',
    type: JigOrder,
  })
  async pickup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() pickupDto: PickupJigOrderDto,
    @CurrentUser() user: User,
  ): Promise<JigOrder> {
    return await this.jigOrderService.pickup(id, pickupDto, user.id);
  }

  @Post(':id/cancel')
  @HasPermission(Permission.JIG_ORDER_UPDATE)
  @ApiOperation({ summary: 'Hủy đơn hàng jig' })
  @ApiResponse({
    status: 200,
    description: 'Đơn hàng đã được hủy',
    type: JigOrder,
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: User,
  ): Promise<JigOrder> {
    return await this.jigOrderService.cancel(id, reason, user.id);
  }

  @Delete(':id')
  @HasPermission(Permission.JIG_ORDER_DELETE)
  @ApiOperation({ summary: 'Xóa đơn hàng jig' })
  @ApiResponse({ status: 200, description: 'Đơn hàng đã được xóa' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.jigOrderService.remove(id, user.id);
    return { message: 'Đơn hàng đã được xóa thành công' };
  }
}
