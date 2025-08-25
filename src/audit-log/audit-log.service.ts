import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../common/entities/audit-log.entity';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(filterDto: AuditLogFilterDto) {
    const {
      page = 1,
      limit = 10,
      userId,
      username,
      tableName,
      action,
      sortField,
      sortOrder,
    } = filterDto;

    const skip = (page - 1) * limit;
    const where = {};

    if (userId) where['userId'] = userId;
    if (username) where['username'] = username;
    if (tableName) where['tableName'] = tableName;
    if (action) where['action'] = action;

    const order = {};
    const safeSortField = sortField || 'createdAt';
    const safeSortOrder = sortOrder || 'DESC';
    order[safeSortField] = safeSortOrder;

    return this.auditLogRepository.findAndCount({
      where,
      skip,
      take: limit,
      order,
    });
  }

  async findByUserId(userId: string) {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTableName(tableName: string) {
    return this.auditLogRepository.find({
      where: { tableName },
      order: { createdAt: 'DESC' },
    });
  }
}
