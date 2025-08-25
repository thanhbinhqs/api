import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApprovalRequestService } from '../services/approval-request.service';
import { ApprovalCommentService } from '../services/approval-comment.service';
import { ApprovalDelegationService } from '../services/approval-delegation.service';
import {
  CreateApprovalRequestDto,
  ApprovalActionDto,
  WithdrawApprovalRequestDto,
  CreateApprovalCommentDto,
  ApprovalRequestQueryDto,
  DelegateApprovalDto,
} from '../dto';

@Controller('approval/requests')
// @UseGuards(JwtAuthGuard) // Sẽ uncomment sau khi có auth guard
export class ApprovalRequestController {
  constructor(
    private readonly requestService: ApprovalRequestService,
    private readonly commentService: ApprovalCommentService,
    private readonly delegationService: ApprovalDelegationService,
  ) {}

  @Post()
  async create(@Body() createDto: CreateApprovalRequestDto, @Request() req) {
    return await this.requestService.create(createDto, req.user.id);
  }

  @Get()
  async findAll(@Query() query: ApprovalRequestQueryDto) {
    return await this.requestService.findAll(query);
  }

  @Get('my-requests')
  async getMyRequests(@Query() query: ApprovalRequestQueryDto, @Request() req) {
    return await this.requestService.getMyRequests(req.user.id, query);
  }

  @Get('pending')
  async getPendingRequests(@Query() query: ApprovalRequestQueryDto, @Request() req) {
    return await this.requestService.getPendingRequests(req.user.id, query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.requestService.findById(id);
  }

  @Post(':id/action')
  async takeAction(
    @Param('id') id: string,
    @Body() actionDto: ApprovalActionDto,
    @Request() req,
  ) {
    return await this.requestService.takeAction(
      id,
      actionDto,
      req.user.id,
      req.user.name || req.user.username,
    );
  }

  @Post(':id/withdraw')
  async withdraw(
    @Param('id') id: string,
    @Body() withdrawDto: WithdrawApprovalRequestDto,
    @Request() req,
  ) {
    return await this.requestService.withdraw(id, withdrawDto, req.user.id);
  }

  @Post(':id/delegate')
  async delegate(
    @Param('id') id: string,
    @Body() delegateDto: DelegateApprovalDto,
    @Request() req,
  ) {
    // Tạo delegation và return success
    // Implementation cụ thể sẽ phụ thuộc vào business logic
    return { message: 'Delegation created successfully' };
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return await this.commentService.getCommentsWithReplies(id);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() commentDto: CreateApprovalCommentDto,
    @Request() req,
  ) {
    return await this.commentService.create(
      { ...commentDto, requestId: id },
      req.user.id,
      req.user.name || req.user.username,
    );
  }
}
