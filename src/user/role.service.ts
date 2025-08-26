import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create({
      ...createRoleDto,
      permissions: createRoleDto.permissions || [],
    });
    return this.roleRepository.save(role);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    sort?: { field: string; order: 'ASC' | 'DESC' },
    filter?: Partial<Role>,
  ): Promise<{ data: Role[]; total: number }> {
    // === VALIDATION VÀ CẤU HÌNH AN TOÀN ===
    const safePage = this.validatePositiveNumber(page, 1);
    const safeLimit = this.validatePositiveNumber(limit, 10, 100);
    const skip = (safePage - 1) * safeLimit;

    const query = this.roleRepository.createQueryBuilder('role');

    // === XỬ LÝ FILTER THEO TỪNG TRƯỜNG CỤ THỂ CỦA ROLE ENTITY ===
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (this.isValidFilterValue(value)) {
          this.applyRoleFieldFilter(query, key as keyof Role, value);
        }
      });
    }

    // === SORTING AN TOÀN ===
    this.applySafeRoleSorting(query, sort);

    const [data, total] = await query
      .skip(skip)
      .take(safeLimit)
      .getManyAndCount();

    return { data, total };
  }

  // === HELPER METHODS CHO ROLE ENTITY ===

  private applyRoleFieldFilter(
    query: any,
    field: keyof Role,
    value: any,
  ): void {
    const trimmedValue = value.toString().trim();

    switch (field) {
      // STRING FIELDS - name và description
      case 'name':
        if (trimmedValue) {
          query.andWhere(`role.${field} ILIKE :${field}`, {
            [field]: `%${trimmedValue}%`,
          });
        }
        break;

      case 'description':
        if (trimmedValue) {
          query.andWhere(`role.${field} ILIKE :${field}`, {
            [field]: `%${trimmedValue}%`,
          });
        }
        break;

      // BOOLEAN FIELDS
      case 'isActive':
      case 'isDeleted':
        const boolValue = this.parseBoolean(value);
        if (boolValue !== null) {
          query.andWhere(`role.${field} = :${field}`, { [field]: boolValue });
        }
        break;

      // DATE FIELDS
      case 'createdAt':
      case 'updatedAt':
        const dateValue = this.parseAndValidateDate(trimmedValue);
        if (dateValue) {
          // Filter by date range (same day)
          const startOfDay = new Date(dateValue);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(dateValue);
          endOfDay.setHours(23, 59, 59, 999);

          query.andWhere(
            `role.${field} BETWEEN :${field}Start AND :${field}End`,
            {
              [`${field}Start`]: startOfDay,
              [`${field}End`]: endOfDay,
            },
          );
        }
        break;

      // UUID FIELDS
      case 'id':
        if (this.isValidUUID(trimmedValue)) {
          query.andWhere(`role.${field} = :${field}`, {
            [field]: trimmedValue,
          });
        }
        break;

      // ARRAY FIELDS (permissions)
      case 'permissions':
        if (Array.isArray(value) && value.length > 0) {
          // Kiểm tra các permission có hợp lệ không
          const validPermissions = value.filter(
            (p) => typeof p === 'string' && p.trim(),
          );
          if (validPermissions.length > 0) {
            query.andWhere(`role.${field} @> :${field}`, {
              [field]: validPermissions,
            });
          }
        } else if (typeof value === 'string' && value.trim()) {
          // Nếu là string, coi như tìm permission có chứa text này
          query.andWhere(`role.${field}::text ILIKE :${field}`, {
            [field]: `%${trimmedValue}%`,
          });
        }
        break;

      // RELATION FIELDS - không filter trực tiếp
      case 'users':
        // Không hỗ trợ filter theo users relationship trực tiếp
        break;

      default:
        // Các trường khác - generic string search nếu là string
        if (trimmedValue) {
          query.andWhere(`role.${field} ILIKE :${field}`, {
            [field]: `%${trimmedValue}%`,
          });
        }
        break;
    }
  }

  private applySafeRoleSorting(
    query: any,
    sort?: { field: string; order: 'ASC' | 'DESC' },
  ): void {
    const validSortFields: (keyof Role)[] = [
      'id',
      'name',
      'description',
      'isActive',
      'createdAt',
      'updatedAt',
    ];

    if (
      sort &&
      sort.field &&
      validSortFields.includes(sort.field as keyof Role)
    ) {
      const safeOrder =
        sort.order === 'ASC' || sort.order === 'DESC' ? sort.order : 'DESC';
      query.orderBy(`role.${sort.field}`, safeOrder);
    } else {
      query.orderBy('role.createdAt', 'DESC');
    }
  }

  // === VALIDATION HELPERS ===

  private isValidFilterValue(value: any): boolean {
    return (
      value !== undefined &&
      value !== 'null' &&
      value !== 'undefined' &&
      value !== '' &&
      value !== null
    );
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private parseAndValidateDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch (error) {
      return null;
    }
  }

  private parseBoolean(value: any): boolean | null {
    if (value === undefined || value === null) return null;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      if (['true', '1', 'yes', 'on'].includes(lowerValue)) return true;
      if (['false', '0', 'no', 'off'].includes(lowerValue)) return false;
    }
    if (typeof value === 'number') return value !== 0;
    return null;
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

  async findOne(id: string): Promise<Role> {
    return this.roleRepository.findOneOrFail({ where: { id } });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    await this.roleRepository.update(id, {
      ...updateRoleDto,
      permissions: updateRoleDto.permissions || [],
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }
}
