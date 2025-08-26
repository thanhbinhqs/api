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

    // === VALIDATION VÀ CẤU HÌNH AN TOÀN ===
    const safePage = this.validatePositiveNumber(page, 1);
    const safeLimit = this.validatePositiveNumber(limit, 10, 100);
    const skip = (safePage - 1) * safeLimit;

    // === XỬ LÝ FILTER THEO TỪNG TRƯỜNG CỤ THỂ CỦA AUDITLOG ENTITY ===
    const queryBuilder = this.auditLogRepository.createQueryBuilder('auditLog');

    // 1. UUID FIELD - userId với validation
    if (userId && userId.trim()) {
      const userIdTerm = userId.trim();
      if (this.isValidUUID(userIdTerm)) {
        queryBuilder.andWhere('auditLog.userId = :userId', {
          userId: userIdTerm,
        });
      }
    }

    // 2. STRING FIELD - username với ILIKE search
    if (username && username.trim()) {
      const usernameTerm = username.trim();
      queryBuilder.andWhere('auditLog.username ILIKE :username', {
        username: `%${usernameTerm}%`,
      });
    }

    // 3. STRING FIELD - tableName với exact match hoặc ILIKE
    if (tableName && tableName.trim()) {
      const tableNameTerm = tableName.trim();
      queryBuilder.andWhere('auditLog.tableName ILIKE :tableName', {
        tableName: `%${tableNameTerm}%`,
      });
    }

    // 4. ENUM FIELD - action với validation
    if (action && action.trim()) {
      const validActions = ['INSERT', 'UPDATE', 'DELETE'];
      const actionTerm = action.trim().toUpperCase();
      if (validActions.includes(actionTerm)) {
        queryBuilder.andWhere('auditLog.action = :action', {
          action: actionTerm,
        });
      }
    }

    // 5. SORTING - chỉ cho phép sort theo các trường có trong entity
    const validSortFields: (keyof AuditLog)[] = [
      'id',
      'tableName',
      'action',
      'username',
      'userId',
      'createdAt',
    ];

    const safeSortField =
      sortField && validSortFields.includes(sortField as keyof AuditLog)
        ? sortField
        : 'createdAt';
    const safeSortOrder =
      sortOrder === 'ASC' || sortOrder === 'DESC' ? sortOrder : 'DESC';

    queryBuilder.orderBy(`auditLog.${safeSortField}`, safeSortOrder);

    // 6. PAGINATION
    const total = await queryBuilder.getCount();
    const auditLogs = await queryBuilder.skip(skip).take(safeLimit).getMany();

    return [auditLogs, total];
  }

  // === HELPER METHODS CHO AUDITLOG ENTITY ===

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private validatePositiveNumber(
    value: any,
    defaultValue: number,
    maxValue?: number,
  ): number {
    const num = parseInt(value);
    if (isNaN(num) || num < 1) return defaultValue;
    return maxValue ? Math.min(num, maxValue) : num;
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
