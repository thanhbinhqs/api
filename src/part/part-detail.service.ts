import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Not, In } from 'typeorm';
import { CreatePartDetailDto } from './dto/create-part-detail.dto';
import { UpdatePartDetailDto } from './dto/update-part-detail.dto';
import { PartDetailFilterDto } from './dto/part-detail-filter.dto';
import { BatchUpdatePartDetailStatusDto } from './dto/batch-update-part-detail-status.dto';
import { PartDetail } from './entities/part-detail.entity';
import { Part } from './entities/part.entity';
import { PaginatedResult } from 'src/common/dto/paginated-result.dto';
import { OptimisticLockingException } from 'src/common/exceptions/optimistic-locking.exception';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PartDetailService {
  constructor(
    @InjectRepository(PartDetail)
    private readonly partDetailRepository: Repository<PartDetail>,
    @InjectRepository(Part)
    private readonly partRepository: Repository<Part>,
  ) {}

  async create(createPartDetailDto: CreatePartDetailDto): Promise<PartDetail> {
    // Kiểm tra serial number đã tồn tại
    if (await this.isSerialNumberExists(createPartDetailDto.serialNumber)) {
      throw new ConflictException('Số serial đã tồn tại');
    }

    const partDetail = this.partDetailRepository.create({
      ...createPartDetailDto,
      part: { id: createPartDetailDto.partId },
      location: createPartDetailDto.locationId ? { id: createPartDetailDto.locationId } : undefined,
      jigDetail: createPartDetailDto.jigDetailId ? { id: createPartDetailDto.jigDetailId } : undefined,
      purchaseDate: createPartDetailDto.purchaseDate ? new Date(createPartDetailDto.purchaseDate) : undefined,
      warrantyExpiration: createPartDetailDto.warrantyExpiration ? new Date(createPartDetailDto.warrantyExpiration) : undefined,
      lastMaintenanceDate: createPartDetailDto.lastMaintenanceDate ? new Date(createPartDetailDto.lastMaintenanceDate) : undefined,
      nextMaintenanceDate: createPartDetailDto.nextMaintenanceDate ? new Date(createPartDetailDto.nextMaintenanceDate) : undefined,
    });

    const savedPartDetail = await this.partDetailRepository.save(partDetail);
    
    // Cập nhật stock của Part nếu isDetailed = true
    await this.updatePartStockIfDetailed(createPartDetailDto.partId);
    
    return savedPartDetail;
  }

  async findAll(filterDto: PartDetailFilterDto): Promise<PaginatedResult<PartDetail>> {
    const { page = 1, limit = 10, search, serialNumber, status, partId, locationId, jigDetailId } = filterDto;
    
    const queryBuilder = this.partDetailRepository.createQueryBuilder('partDetail')
      .leftJoinAndSelect('partDetail.part', 'part')
      .leftJoinAndSelect('partDetail.location', 'location')
      .leftJoinAndSelect('partDetail.jigDetail', 'jigDetail');

    if (search) {
      queryBuilder.where(
        '(partDetail.serialNumber ILIKE :search OR partDetail.notes ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (serialNumber) {
      queryBuilder.andWhere('partDetail.serialNumber ILIKE :serialNumber', { serialNumber: `%${serialNumber}%` });
    }

    if (status) {
      queryBuilder.andWhere('partDetail.status = :status', { status });
    }

    if (partId) {
      queryBuilder.andWhere('partDetail.part.id = :partId', { partId });
    }

    if (locationId) {
      queryBuilder.andWhere('partDetail.location.id = :locationId', { locationId });
    }

    if (jigDetailId) {
      queryBuilder.andWhere('partDetail.jigDetail.id = :jigDetailId', { jigDetailId });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<PartDetail> {
    const partDetail = await this.partDetailRepository.findOne({
      where: { id },
      relations: ['part', 'location', 'jigDetail', 'inOutHistories'],
    });

    if (!partDetail) {
      throw new NotFoundException('Không tìm thấy part detail');
    }

    return partDetail;
  }

  async findBySerialNumber(serialNumber: string): Promise<PartDetail> {
    const partDetail = await this.partDetailRepository.findOne({
      where: { serialNumber },
      relations: ['part', 'location'],
    });

    if (!partDetail) {
      throw new NotFoundException('Không tìm thấy part detail với số serial này');
    }

    return partDetail;
  }

  async update(id: string, updatePartDetailDto: UpdatePartDetailDto): Promise<PartDetail> {
    const partDetail = await this.findOne(id);
    const oldStatus = partDetail.status;

    // Kiểm tra version để tránh optimistic locking conflict
    if (partDetail.version !== updatePartDetailDto.version) {
      throw new OptimisticLockingException('PartDetail', id);
    }

    // Kiểm tra serial number đã tồn tại (trừ chính nó)
    if (updatePartDetailDto.serialNumber && updatePartDetailDto.serialNumber !== partDetail.serialNumber) {
      if (await this.isSerialNumberExists(updatePartDetailDto.serialNumber, id)) {
        throw new ConflictException('Số serial đã tồn tại');
      }
    }

    const newVersion = uuidv4();
    const { version: _, ...updateDataWithoutVersion } = updatePartDetailDto;
    const updateData = {
      ...updateDataWithoutVersion,
      version: newVersion,
      part: updatePartDetailDto.partId ? { id: updatePartDetailDto.partId } : undefined,
      location: updatePartDetailDto.locationId ? { id: updatePartDetailDto.locationId } : undefined,
      purchaseDate: updatePartDetailDto.purchaseDate ? new Date(updatePartDetailDto.purchaseDate) : undefined,
      warrantyExpiration: updatePartDetailDto.warrantyExpiration ? new Date(updatePartDetailDto.warrantyExpiration) : undefined,
      lastMaintenanceDate: updatePartDetailDto.lastMaintenanceDate ? new Date(updatePartDetailDto.lastMaintenanceDate) : undefined,
      nextMaintenanceDate: updatePartDetailDto.nextMaintenanceDate ? new Date(updatePartDetailDto.nextMaintenanceDate) : undefined,
    };

    const result = await this.partDetailRepository.update(
      { id, version: updatePartDetailDto.version }, // WHERE clause với version check
      updateData
    );

    if (result.affected === 0) {
      throw new OptimisticLockingException('PartDetail', id);
    }
    
    // Cập nhật stock của Part nếu status thay đổi và Part có isDetailed = true
    if (updatePartDetailDto.status && updatePartDetailDto.status !== oldStatus) {
      await this.updatePartStockIfDetailed(partDetail.part.id);
    }
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const partDetail = await this.findOne(id);
    const partId = partDetail.part.id;
    
    await this.partDetailRepository.softDelete(id);
    
    // Cập nhật stock của Part sau khi xóa PartDetail
    await this.updatePartStockIfDetailed(partId);
  }

  async findByPartId(partId: string): Promise<PartDetail[]> {
    return await this.partDetailRepository.find({
      where: { part: { id: partId } },
      relations: ['location'],
    });
  }

  async updateStatusBatch(partDetailIds: string[], newStatus: string, versions?: string[]): Promise<void> {
    // Lấy tất cả part details và part ids liên quan
    const partDetails = await this.partDetailRepository.find({
      where: { id: In(partDetailIds) },
      relations: ['part'],
    });

    if (partDetails.length === 0) {
      throw new NotFoundException('Không tìm thấy part detail nào');
    }

    if (partDetails.length !== partDetailIds.length) {
      throw new NotFoundException('Một số part detail không tồn tại');
    }

    // Nếu có versions, kiểm tra từng version
    if (versions && versions.length > 0) {
      if (versions.length !== partDetailIds.length) {
        throw new ConflictException('Số lượng versions phải bằng số lượng part detail IDs');
      }

      for (let i = 0; i < partDetails.length; i++) {
        const partDetail = partDetails.find(pd => pd.id === partDetailIds[i]);
        if (partDetail && partDetail.version !== versions[i]) {
          throw new OptimisticLockingException('PartDetail', partDetail.id);
        }
      }
    }

    // Update status hàng loạt với version mới
    for (const partDetail of partDetails) {
      const newVersion = uuidv4();
      const result = await this.partDetailRepository.update(
        { 
          id: partDetail.id,
          ...(versions ? { version: partDetail.version } : {})
        },
        { 
          status: newStatus as any,
          version: newVersion
        }
      );

      if (versions && result.affected === 0) {
        throw new OptimisticLockingException('PartDetail', partDetail.id);
      }
    }

    // Cập nhật stock cho tất cả parts liên quan
    const partIds = [...new Set(partDetails.map(pd => pd.part.id))];
    for (const partId of partIds) {
      await this.updatePartStockIfDetailed(partId);
    }
  }

  async batchUpdateStatus(batchUpdateDto: BatchUpdatePartDetailStatusDto): Promise<{
    success: string[];
    failed: { id: string; error: string }[];
    total: number;
    successCount: number;
    failedCount: number;
  }> {
    const { partDetailIds, status, notes, locationId, jigDetailId, saveAsDefault } = batchUpdateDto;
    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
      total: partDetailIds.length,
    };

    // Kiểm tra tất cả Part Details có tồn tại không
    const partDetails = await this.partDetailRepository.find({
      where: { id: In(partDetailIds) },
      relations: ['location', 'jigDetail', 'defaultLocation', 'defaultJigDetail'],
    });

    const foundIds = partDetails.map(pd => pd.id);
    const notFoundIds = partDetailIds.filter(id => !foundIds.includes(id));

    // Thêm các ID không tìm thấy vào failed
    notFoundIds.forEach(id => {
      results.failed.push({ id, error: 'Part Detail không tồn tại' });
    });

    // Validate location và jigDetail nếu có
    let location = null;
    let jigDetail = null;

    if (locationId) {
      // Import và inject Location repository nếu cần
      // Tạm thời skip validation location
    }

    if (jigDetailId) {
      // Import và inject JigDetail repository nếu cần
      // Tạm thời skip validation jigDetail
    }

    // Cập nhật từng Part Detail
    for (const partDetail of partDetails) {
      try {
        // Lưu vị trí hiện tại làm mặc định nếu được yêu cầu
        if (saveAsDefault) {
          if (partDetail.location) {
            partDetail.defaultLocation = partDetail.location;
          }
          if (partDetail.jigDetail) {
            partDetail.defaultJigDetail = partDetail.jigDetail;
          }
        }

        partDetail.status = status;
        
        if (notes) {
          partDetail.notes = notes;
        }

        if (locationId) {
          partDetail.location = { id: locationId } as any;
        }

        if (jigDetailId) {
          partDetail.jigDetail = { id: jigDetailId } as any;
        }

        // Cập nhật ngày maintenance nếu status là maintenance
        if (status === 'maintenance') {
          partDetail.lastMaintenanceDate = new Date();
        }

        await this.partDetailRepository.save(partDetail);
        results.success.push(partDetail.id);
      } catch (error) {
        results.failed.push({ 
          id: partDetail.id, 
          error: error.message || 'Lỗi không xác định' 
        });
      }
    }

    return {
      ...results,
      successCount: results.success.length,
      failedCount: results.failed.length,
    };
  }

  async setDefaultLocation(partDetailId: string, locationId?: string, jigDetailId?: string): Promise<PartDetail> {
    const partDetail = await this.findOne(partDetailId);
    
    if (locationId) {
      partDetail.defaultLocation = { id: locationId } as any;
    }
    
    if (jigDetailId) {
      partDetail.defaultJigDetail = { id: jigDetailId } as any;
    }
    
    return await this.partDetailRepository.save(partDetail);
  }

  async restoreToDefaultLocation(partDetailId: string): Promise<PartDetail> {
    const partDetail = await this.partDetailRepository.findOne({
      where: { id: partDetailId },
      relations: ['defaultLocation', 'defaultJigDetail'],
    });

    if (!partDetail) {
      throw new NotFoundException(`Part Detail với ID ${partDetailId} không tồn tại`);
    }

    if (partDetail.defaultLocation) {
      partDetail.location = partDetail.defaultLocation;
    }

    if (partDetail.defaultJigDetail) {
      partDetail.jigDetail = partDetail.defaultJigDetail;
    }

    return await this.partDetailRepository.save(partDetail);
  }

  private async isSerialNumberExists(serialNumber: string, excludeId?: string): Promise<boolean> {
    const whereCondition: FindOptionsWhere<PartDetail> = { serialNumber };
    if (excludeId) {
      whereCondition.id = Not(excludeId);
    }
    
    const count = await this.partDetailRepository.count({ where: whereCondition });
    return count > 0;
  }

  private async updatePartStockIfDetailed(partId: string): Promise<void> {
    try {
      const part = await this.partRepository.findOne({
        where: { id: partId },
        relations: ['details'],
      });

      if (!part || !part.isDetailed) {
        return; // Chỉ update nếu part có isDetailed = true
      }

      // Đếm theo status của PartDetail
      const availableCount = part.details.filter(detail => 
        detail.status === 'available'
      ).length;
      
      const inUseCount = part.details.filter(detail => 
        detail.status === 'in-use'
      ).length;
      
      const maintenanceCount = part.details.filter(detail => 
        detail.status === 'maintenance' || detail.status === 'repair'
      ).length;

      const totalCount = part.details.length;

      await this.partRepository.update(partId, {
        currentStock: totalCount,
        availableStock: availableCount,
        reservedStock: inUseCount + maintenanceCount,
      });
    } catch (error) {
      // Log error nhưng không throw để không làm gián đoạn flow chính
      console.error('Error updating part stock:', error);
    }
  }

  async findByJigDetail(jigDetailId: string): Promise<PartDetail[]> {
    return await this.partDetailRepository.find({
      where: { jigDetail: { id: jigDetailId } },
      relations: ['part', 'location'],
    });
  }

  async updateJigDetail(id: string, jigDetailId: string | null): Promise<PartDetail> {
    const partDetail = await this.findOne(id);
    
    if (jigDetailId) {
      partDetail.jigDetail = { id: jigDetailId } as any;
    } else {
      partDetail.jigDetail = undefined;
    }
    
    return await this.partDetailRepository.save(partDetail);
  }
}
