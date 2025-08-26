import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateJigDetailDto } from './dto/create-jig-detail.dto';
import { UpdateJigDetailDto } from './dto/update-jig-detail.dto';
import { JigDetailFilterDto } from './dto/jig-detail-filter.dto';
import { BatchUpdateJigDetailStatusDto } from './dto/batch-update-jig-detail-status.dto';
import { JigDetail, JigStatus } from './entities/jig-detail.entity';
import { PaginatedResult } from 'src/common/dto/paginated-result.dto';

@Injectable()
export class JigDetailService {
  constructor(
    @InjectRepository(JigDetail)
    private readonly jigDetailRepository: Repository<JigDetail>,
  ) {}

  async create(createJigDetailDto: CreateJigDetailDto): Promise<JigDetail> {
    try {
      const jigDetail = this.jigDetailRepository.create(createJigDetailDto);
      return await this.jigDetailRepository.save(jigDetail);
    } catch (error) {
      if (error.code === '23505') {
        // Unique violation
        throw new BadRequestException('Jig detail với code này đã tồn tại');
      }
      throw error;
    }
  }

  async findAll(
    filterDto: JigDetailFilterDto,
  ): Promise<PaginatedResult<JigDetail>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      jigId,
      code,
      mesCode,
      status,
      locationId,
      lineId,
      vendorId,
      lastMaintenanceDateFrom,
      lastMaintenanceDateTo,
    } = filterDto;

    const queryBuilder = this.jigDetailRepository
      .createQueryBuilder('jigDetail')
      .leftJoinAndSelect('jigDetail.jig', 'jig')
      .leftJoinAndSelect('jigDetail.location', 'location')
      .leftJoinAndSelect('jigDetail.line', 'line')
      .leftJoinAndSelect('jigDetail.vendor', 'vendor')
      .leftJoinAndSelect('jigDetail.partDetails', 'partDetails')
      .leftJoinAndSelect('partDetails.part', 'part');

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(jigDetail.code ILIKE :search OR jigDetail.mesCode ILIKE :search OR jigDetail.description ILIKE :search OR jig.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filters
    if (jigId) {
      queryBuilder.andWhere('jigDetail.jigId = :jigId', { jigId });
    }

    if (code) {
      queryBuilder.andWhere('jigDetail.code ILIKE :code', {
        code: `%${code}%`,
      });
    }

    if (mesCode) {
      queryBuilder.andWhere('jigDetail.mesCode ILIKE :mesCode', {
        mesCode: `%${mesCode}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('jigDetail.status = :status', { status });
    }

    if (locationId) {
      queryBuilder.andWhere('jigDetail.locationId = :locationId', {
        locationId,
      });
    }

    if (lineId) {
      queryBuilder.andWhere('jigDetail.lineId = :lineId', { lineId });
    }

    if (vendorId) {
      queryBuilder.andWhere('jigDetail.vendorId = :vendorId', { vendorId });
    }

    if (lastMaintenanceDateFrom) {
      queryBuilder.andWhere('jigDetail.lastMaintenanceDate >= :from', {
        from: lastMaintenanceDateFrom,
      });
    }

    if (lastMaintenanceDateTo) {
      queryBuilder.andWhere('jigDetail.lastMaintenanceDate <= :to', {
        to: lastMaintenanceDateTo,
      });
    }

    // Sorting
    queryBuilder.orderBy(`jigDetail.${sortBy}`, sortOrder);

    // Pagination
    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResult(items, total, page, limit);
  }

  async findOne(id: string): Promise<JigDetail> {
    const jigDetail = await this.jigDetailRepository.findOne({
      where: { id },
      relations: [
        'jig',
        'location',
        'line',
        'vendor',
        'partDetails',
        'partDetails.part',
        'inOutHistories',
      ],
    });

    if (!jigDetail) {
      throw new NotFoundException(`Không tìm thấy jig detail với ID ${id}`);
    }

    return jigDetail;
  }

  async update(
    id: string,
    updateJigDetailDto: UpdateJigDetailDto,
  ): Promise<JigDetail> {
    const jigDetail = await this.findOne(id);

    try {
      Object.assign(jigDetail, updateJigDetailDto);
      return await this.jigDetailRepository.save(jigDetail);
    } catch (error) {
      if (error.code === '23505') {
        // Unique violation
        throw new BadRequestException('Jig detail với code này đã tồn tại');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const jigDetail = await this.findOne(id);
    await this.jigDetailRepository.remove(jigDetail);
  }

  async findByCode(code: string): Promise<JigDetail | null> {
    return await this.jigDetailRepository.findOne({
      where: { code },
      relations: ['jig', 'location', 'line', 'vendor', 'partDetails'],
    });
  }

  async findByMesCode(mesCode: string): Promise<JigDetail | null> {
    return await this.jigDetailRepository.findOne({
      where: { mesCode },
      relations: ['jig', 'location', 'line', 'vendor', 'partDetails'],
    });
  }

  async updateStatus(id: string, status: JigStatus): Promise<JigDetail> {
    const jigDetail = await this.findOne(id);
    jigDetail.status = status;
    return await this.jigDetailRepository.save(jigDetail);
  }

  async updateLocation(
    id: string,
    locationId: string | null,
    lineId: string | null,
    vendorId: string | null,
  ): Promise<JigDetail> {
    const jigDetail = await this.findOne(id);

    // Reset all locations first
    jigDetail.location = undefined;
    jigDetail.line = undefined;
    jigDetail.vendor = undefined;

    // Set the new location
    if (locationId) {
      jigDetail.location = { id: locationId } as any;
      jigDetail.status = JigStatus.STORAGE;
    } else if (lineId) {
      jigDetail.line = { id: lineId } as any;
      jigDetail.status = JigStatus.LINE;
    } else if (vendorId) {
      jigDetail.vendor = { id: vendorId } as any;
      jigDetail.status = JigStatus.VENDOR;
    }

    return await this.jigDetailRepository.save(jigDetail);
  }

  async updateMaintenanceDate(
    id: string,
    maintenanceDate: Date,
  ): Promise<JigDetail> {
    const jigDetail = await this.findOne(id);
    jigDetail.lastMaintenanceDate = maintenanceDate;
    return await this.jigDetailRepository.save(jigDetail);
  }

  async getJigDetailsByJig(jigId: string): Promise<JigDetail[]> {
    return await this.jigDetailRepository.find({
      where: { jig: { id: jigId } },
      relations: ['location', 'line', 'vendor', 'partDetails'],
    });
  }

  async getJigDetailsNeedingMaintenance(
    days: number = 30,
  ): Promise<JigDetail[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.jigDetailRepository
      .createQueryBuilder('jigDetail')
      .leftJoinAndSelect('jigDetail.jig', 'jig')
      .where('jig.needMaintenance = :needMaintenance', {
        needMaintenance: true,
      })
      .andWhere(
        '(jigDetail.lastMaintenanceDate IS NULL OR jigDetail.lastMaintenanceDate <= :cutoffDate)',
        { cutoffDate },
      )
      .getMany();
  }

  async batchUpdateStatus(
    batchUpdateDto: BatchUpdateJigDetailStatusDto,
  ): Promise<{
    success: string[];
    failed: { id: string; error: string }[];
    total: number;
    successCount: number;
    failedCount: number;
  }> {
    const {
      jigDetailIds,
      status,
      notes,
      locationId,
      lineId,
      vendorId,
      saveAsDefault,
      useDefault,
    } = batchUpdateDto;
    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
      total: jigDetailIds.length,
    };

    // Kiểm tra tất cả Jig Details có tồn tại không
    const jigDetails = await this.jigDetailRepository.find({
      where: { id: In(jigDetailIds) },
      relations: [
        'location',
        'line',
        'vendor',
        'defaultLocation',
        'defaultLine',
        'defaultVendor',
      ],
    });

    const foundIds = jigDetails.map((jd) => jd.id);
    const notFoundIds = jigDetailIds.filter((id) => !foundIds.includes(id));

    // Thêm các ID không tìm thấy vào failed
    notFoundIds.forEach((id) => {
      results.failed.push({ id, error: 'Jig Detail không tồn tại' });
    });

    // Validate relationships nếu có
    // Tạm thời skip validation cho location, line, vendor

    // Cập nhật từng Jig Detail
    for (const jigDetail of jigDetails) {
      try {
        // Lưu vị trí hiện tại làm mặc định nếu được yêu cầu
        if (saveAsDefault) {
          if (jigDetail.location) {
            jigDetail.defaultLocation = jigDetail.location;
          }
          if (jigDetail.line) {
            jigDetail.defaultLine = jigDetail.line;
          }
          if (jigDetail.vendor) {
            jigDetail.defaultVendor = jigDetail.vendor;
          }
        }

        jigDetail.status = status;

        // Cập nhật location, line, vendor dựa trên status
        if (status === JigStatus.STORAGE) {
          if (useDefault && jigDetail.defaultLocation) {
            jigDetail.location = jigDetail.defaultLocation;
          } else if (locationId) {
            jigDetail.location = { id: locationId } as any;
          }
          jigDetail.line = undefined;
          jigDetail.vendor = undefined;
        } else if (status === JigStatus.LINE) {
          if (useDefault && jigDetail.defaultLine) {
            jigDetail.line = jigDetail.defaultLine;
          } else if (lineId) {
            jigDetail.line = { id: lineId } as any;
          }
          jigDetail.location = undefined;
          jigDetail.vendor = undefined;
        } else if (status === JigStatus.VENDOR) {
          if (useDefault && jigDetail.defaultVendor) {
            jigDetail.vendor = jigDetail.defaultVendor;
          } else if (vendorId) {
            jigDetail.vendor = { id: vendorId } as any;
          }
          jigDetail.location = undefined;
          jigDetail.line = undefined;
        } else if (status === JigStatus.REPAIR || status === JigStatus.SCRAP) {
          // Khi repair hoặc scrap, có thể sử dụng default location hoặc location mới
          if (useDefault && jigDetail.defaultLocation) {
            jigDetail.location = jigDetail.defaultLocation;
          } else if (locationId) {
            jigDetail.location = { id: locationId } as any;
          }
          jigDetail.line = undefined;
          jigDetail.vendor = undefined;
        }

        // Cập nhật maintenance date nếu status là repair
        if (status === JigStatus.REPAIR) {
          jigDetail.lastMaintenanceDate = new Date();
        }

        await this.jigDetailRepository.save(jigDetail);
        results.success.push(jigDetail.id);
      } catch (error) {
        results.failed.push({
          id: jigDetail.id,
          error: error.message || 'Lỗi không xác định',
        });
      }
    }

    return {
      ...results,
      successCount: results.success.length,
      failedCount: results.failed.length,
    };
  }

  async setDefaultLocations(
    jigDetailId: string,
    locationId?: string,
    lineId?: string,
    vendorId?: string,
  ): Promise<JigDetail> {
    const jigDetail = await this.findOne(jigDetailId);

    if (locationId) {
      jigDetail.defaultLocation = { id: locationId } as any;
    }

    if (lineId) {
      jigDetail.defaultLine = { id: lineId } as any;
    }

    if (vendorId) {
      jigDetail.defaultVendor = { id: vendorId } as any;
    }

    return await this.jigDetailRepository.save(jigDetail);
  }

  async restoreToDefaultLocations(jigDetailId: string): Promise<JigDetail> {
    const jigDetail = await this.jigDetailRepository.findOne({
      where: { id: jigDetailId },
      relations: ['defaultLocation', 'defaultLine', 'defaultVendor'],
    });

    if (!jigDetail) {
      throw new NotFoundException(
        `Jig Detail với ID ${jigDetailId} không tồn tại`,
      );
    }

    // Khôi phục dựa trên status hiện tại
    if (jigDetail.status === JigStatus.STORAGE && jigDetail.defaultLocation) {
      jigDetail.location = jigDetail.defaultLocation;
    } else if (jigDetail.status === JigStatus.LINE && jigDetail.defaultLine) {
      jigDetail.line = jigDetail.defaultLine;
    } else if (
      jigDetail.status === JigStatus.VENDOR &&
      jigDetail.defaultVendor
    ) {
      jigDetail.vendor = jigDetail.defaultVendor;
    }

    return await this.jigDetailRepository.save(jigDetail);
  }
}
