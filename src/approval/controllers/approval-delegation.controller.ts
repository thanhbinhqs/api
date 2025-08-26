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
import { ApprovalDelegationService } from '../services/approval-delegation.service';
import {
  CreateApprovalDelegationDto,
  UpdateApprovalDelegationDto,
} from '../dto';

@Controller('approval/delegations')
// @UseGuards(JwtAuthGuard) // Sẽ uncomment sau khi có auth guard
export class ApprovalDelegationController {
  constructor(private readonly delegationService: ApprovalDelegationService) {}

  @Post()
  async create(@Body() createDto: CreateApprovalDelegationDto, @Request() req) {
    return await this.delegationService.create(
      createDto,
      req.user?.id || 'user-id',
    );
  }

  @Get()
  async findByUser(@Request() req) {
    return await this.delegationService.findByUserId(req.user?.id || 'user-id');
  }

  @Get('active')
  async getActiveDelegations(
    @Query('workflowCode') workflowCode: string,
    @Request() req,
  ) {
    return await this.delegationService.findActiveDelegations(
      req.user?.id || 'user-id',
      workflowCode,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.delegationService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateApprovalDelegationDto,
    @Request() req,
  ) {
    return await this.delegationService.update(
      id,
      updateDto,
      req.user?.id || 'user-id',
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.delegationService.delete(id, req.user?.id || 'user-id');
    return { message: 'Delegation deleted successfully' };
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string, @Request() req) {
    return await this.delegationService.deactivate(
      id,
      req.user?.id || 'user-id',
    );
  }
}
