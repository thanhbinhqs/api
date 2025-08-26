import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, Not } from 'typeorm';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartFilterDto } from './dto/part-filter.dto';
import { Part } from './entities/part.entity';
import { PaginatedResult } from 'src/common/dto/paginated-result.dto';
import { InOutType } from 'src/meta/entities/inout-history.entity';
import { OptimisticLockingException } from 'src/common/exceptions/optimistic-locking.exception';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PartService {
  constructor(
    @InjectRepository(Part)
    private readonly partRepository: Repository<Part>,
  ) {}

  async create(createPartDto: CreatePartDto): Promise<Part> {
    // Kiểm tra tên part đã tồn tại
    if (await this.isNameExists(createPartDto.name)) {
      throw new ConflictException('Tên part đã tồn tại');
    }

    // Kiểm tra mã part đã tồn tại (nếu có)
    if (createPartDto.code && (await this.isCodeExists(createPartDto.code))) {
      throw new ConflictException('Mã part đã tồn tại');
    }

    const part = this.partRepository.create({
      ...createPartDto,
      project: createPartDto.projectId
        ? { id: createPartDto.projectId }
        : undefined,
      vendor: createPartDto.vendorId
        ? { id: createPartDto.vendorId }
        : undefined,
      location: createPartDto.defaultLocationId
        ? { id: createPartDto.defaultLocationId }
        : undefined,
      jig: createPartDto.jigId ? { id: createPartDto.jigId } : undefined,
    });

    return await this.partRepository.save(part);
  }

  async findAll(filterDto: PartFilterDto): Promise<PaginatedResult<Part>> {
    const {
      page = 1,
      limit = 10,
      search,
      code,
      orderType,
      isDetailed,
      projectId,
      vendorId,
      defaultLocationId,
      jigId,
    } = filterDto;

    const queryBuilder = this.partRepository
      .createQueryBuilder('part')
      .leftJoinAndSelect('part.project', 'project')
      .leftJoinAndSelect('part.vendor', 'vendor')
      .leftJoinAndSelect('part.location', 'location')
      .leftJoinAndSelect('part.jig', 'jig');

    // === XỬ LÝ FILTER THEO TỪNG TRƯỜNG CỤ THỂ CỦA PART ENTITY ===

    // 1. STRING FIELDS - name, description, code với validation
    if (search && search.trim()) {
      const searchTerm = search.trim();
      queryBuilder.where(
        '(part.name ILIKE :search OR part.description ILIKE :search OR part.code ILIKE :search)',
        { search: `%${searchTerm}%` },
      );
    }

    if (code && code.trim()) {
      const codeTerm = code.trim();
      queryBuilder.andWhere('part.code ILIKE :code', { code: `%${codeTerm}%` });
    }

    // 2. ENUM FIELD - orderType với validation
    if (orderType && orderType.trim()) {
      const validOrderTypes = ['material', 'mro', 'self-made'];
      const orderTypeTerm = orderType.trim();
      if (validOrderTypes.includes(orderTypeTerm)) {
        queryBuilder.andWhere('part.orderType = :orderType', {
          orderType: orderTypeTerm,
        });
      }
    }

    // 3. BOOLEAN FIELD - isDetailed với proper parsing
    if (isDetailed !== undefined && isDetailed !== null) {
      const isDetailedValue = this.parseBoolean(isDetailed);
      if (isDetailedValue !== null) {
        queryBuilder.andWhere('part.isDetailed = :isDetailed', {
          isDetailed: isDetailedValue,
        });
      }
    }

    // 4. RELATION FIELDS - UUID validation cho các relationships
    if (projectId && projectId.trim()) {
      const projectIdTerm = projectId.trim();
      if (this.isValidUUID(projectIdTerm)) {
        queryBuilder.andWhere('part.project.id = :projectId', {
          projectId: projectIdTerm,
        });
      }
    }

    if (vendorId && vendorId.trim()) {
      const vendorIdTerm = vendorId.trim();
      if (this.isValidUUID(vendorIdTerm)) {
        queryBuilder.andWhere('part.vendor.id = :vendorId', {
          vendorId: vendorIdTerm,
        });
      }
    }

    if (defaultLocationId && defaultLocationId.trim()) {
      const locationIdTerm = defaultLocationId.trim();
      if (this.isValidUUID(locationIdTerm)) {
        queryBuilder.andWhere('part.location.id = :defaultLocationId', {
          defaultLocationId: locationIdTerm,
        });
      }
    }

    if (jigId && jigId.trim()) {
      const jigIdTerm = jigId.trim();
      if (this.isValidUUID(jigIdTerm)) {
        queryBuilder.andWhere('part.jig.id = :jigId', { jigId: jigIdTerm });
      }
    }

    // 5. SORTING - chỉ cho phép sort theo các trường có trong entity
    const validSortFields: (keyof Part)[] = [
      'id',
      'name',
      'code',
      'price',
      'orderType',
      'unit',
      'isDetailed',
      'safeStock',
      'currentStock',
      'availableStock',
      'reservedStock',
      'createdAt',
      'updatedAt',
    ];

    const sortBy =
      filterDto.sortBy &&
      validSortFields.includes(filterDto.sortBy as keyof Part)
        ? filterDto.sortBy
        : 'createdAt';
    const sortOrder =
      filterDto.sortOrder === 'ASC' || filterDto.sortOrder === 'DESC'
        ? filterDto.sortOrder
        : 'DESC';

    queryBuilder.orderBy(`part.${sortBy}`, sortOrder);

    // 6. PAGINATION - với validation số học
    const safePage = this.validatePositiveNumber(page, 1);
    const safeLimit = this.validatePositiveNumber(limit, 10, 100);
    const skip = (safePage - 1) * safeLimit;

    queryBuilder.skip(skip).take(safeLimit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
      hasNext: safePage < Math.ceil(total / safeLimit),
      hasPrev: safePage > 1,
    };
  }

  // === HELPER METHODS CHO PART ENTITY ===

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
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

  async findOne(id: string): Promise<Part> {
    const part = await this.partRepository.findOne({
      where: { id },
      relations: [
        'project',
        'vendor',
        'defaultLocation',
        'details',
        'inOutHistories',
      ],
    });

    if (!part) {
      throw new NotFoundException('Không tìm thấy part');
    }

    return part;
  }

  async findByCode(code: string): Promise<Part> {
    const part = await this.partRepository.findOne({
      where: { code },
      relations: ['project', 'vendor', 'defaultLocation'],
    });

    if (!part) {
      throw new NotFoundException('Không tìm thấy part với mã này');
    }

    return part;
  }

  async findByName(name: string): Promise<Part> {
    const part = await this.partRepository.findOne({
      where: { name },
      relations: ['project', 'vendor', 'defaultLocation'],
    });

    if (!part) {
      throw new NotFoundException('Không tìm thấy part với tên này');
    }

    return part;
  }

  async update(id: string, updatePartDto: UpdatePartDto): Promise<Part> {
    const part = await this.findOne(id);

    // Kiểm tra version để tránh optimistic locking conflict
    if (part.version !== updatePartDto.version) {
      throw new OptimisticLockingException('Part', id);
    }

    // Kiểm tra tên part đã tồn tại (trừ chính nó)
    if (updatePartDto.name && updatePartDto.name !== part.name) {
      if (await this.isNameExists(updatePartDto.name, id)) {
        throw new ConflictException('Tên part đã tồn tại');
      }
    }

    // Kiểm tra mã part đã tồn tại (trừ chính nó)
    if (updatePartDto.code && updatePartDto.code !== part.code) {
      if (await this.isCodeExists(updatePartDto.code, id)) {
        throw new ConflictException('Mã part đã tồn tại');
      }
    }

    const newVersion = uuidv4();
    const { version: _, ...updateDataWithoutVersion } = updatePartDto;
    const updateData = {
      ...updateDataWithoutVersion,
      version: newVersion,
      project: updatePartDto.projectId
        ? { id: updatePartDto.projectId }
        : undefined,
      vendor: updatePartDto.vendorId
        ? { id: updatePartDto.vendorId }
        : undefined,
      defaultLocation: updatePartDto.defaultLocationId
        ? { id: updatePartDto.defaultLocationId }
        : undefined,
    };

    const result = await this.partRepository.update(
      { id, version: updatePartDto.version }, // WHERE clause với version check
      updateData,
    );

    if (result.affected === 0) {
      throw new OptimisticLockingException('Part', id);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const part = await this.findOne(id);
    await this.partRepository.softDelete(id);
  }

  async updateStock(partId: string): Promise<void> {
    const part = await this.partRepository.findOne({
      where: { id: partId },
      relations: ['inOutHistories', 'details'],
    });

    if (!part) {
      throw new NotFoundException('Không tìm thấy part');
    }

    if (part.isDetailed) {
      // Quản lý theo PartDetail - đếm theo status
      const availableCount = part.details.filter(
        (detail) => detail.status === 'available',
      ).length;

      const inUseCount = part.details.filter(
        (detail) => detail.status === 'in-use',
      ).length;

      const maintenanceCount = part.details.filter(
        (detail) =>
          detail.status === 'maintenance' || detail.status === 'repair',
      ).length;

      const scrapCount = part.details.filter(
        (detail) => detail.status === 'scrap',
      ).length;

      const totalCount = part.details.length;

      await this.partRepository.update(partId, {
        currentStock: totalCount,
        availableStock: availableCount,
        reservedStock: inUseCount + maintenanceCount,
      });
    } else {
      // Quản lý theo số lượng - tính từ InOutHistory
      let currentStock = 0;
      for (const history of part.inOutHistories) {
        switch (history.type) {
          case InOutType.NEW:
          case InOutType.IN:
          case InOutType.REPAIRED:
            currentStock += history.quantity;
            break;
          case InOutType.OUT:
          case InOutType.SCRAP:
            currentStock -= history.quantity;
            break;
        }
      }

      await this.partRepository.update(partId, {
        currentStock,
        availableStock: Math.max(0, currentStock),
        reservedStock: 0, // Có thể cập nhật logic reserved nếu cần
      });
    }
  }

  async getStockSummary(id: string): Promise<any> {
    const part = await this.partRepository.findOne({
      where: { id },
      relations: ['details', 'inOutHistories'],
    });

    if (!part) {
      throw new NotFoundException('Không tìm thấy part');
    }

    if (part.isDetailed) {
      // Trả về thống kê theo status của PartDetail
      const statusCount = {
        available: part.details.filter((d) => d.status === 'available').length,
        inUse: part.details.filter((d) => d.status === 'in-use').length,
        maintenance: part.details.filter((d) => d.status === 'maintenance')
          .length,
        repair: part.details.filter((d) => d.status === 'repair').length,
        scrap: part.details.filter((d) => d.status === 'scrap').length,
        total: part.details.length,
      };

      return {
        isDetailed: true,
        statusCount,
        currentStock: statusCount.total,
        availableStock: statusCount.available,
        reservedStock:
          statusCount.inUse + statusCount.maintenance + statusCount.repair,
      };
    } else {
      // Trả về thống kê theo InOutHistory
      let totalIn = 0;
      let totalOut = 0;

      for (const history of part.inOutHistories) {
        switch (history.type) {
          case InOutType.NEW:
          case InOutType.IN:
          case InOutType.REPAIRED:
            totalIn += history.quantity;
            break;
          case InOutType.OUT:
          case InOutType.SCRAP:
            totalOut += history.quantity;
            break;
        }
      }

      const currentStock = totalIn - totalOut;

      return {
        isDetailed: false,
        quantityHistory: {
          totalIn,
          totalOut,
          currentStock: Math.max(0, currentStock),
        },
        currentStock: Math.max(0, currentStock),
        availableStock: Math.max(0, currentStock),
        reservedStock: 0,
      };
    }
  }

  private async isNameExists(
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const whereCondition: FindOptionsWhere<Part> = { name };
    if (excludeId) {
      whereCondition.id = Not(excludeId);
    }

    const count = await this.partRepository.count({ where: whereCondition });
    return count > 0;
  }

  private async isCodeExists(
    code: string,
    excludeId?: string,
  ): Promise<boolean> {
    const whereCondition: FindOptionsWhere<Part> = { code };
    if (excludeId) {
      whereCondition.id = Not(excludeId);
    }

    const count = await this.partRepository.count({ where: whereCondition });
    return count > 0;
  }
}
