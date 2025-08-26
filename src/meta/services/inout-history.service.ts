import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InOutHistory } from '../entities/inout-history.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateInOutHistoryDto } from '../dto/inout-history/create-inout-history.dto';
import { UpdateInOutHistoryDto } from '../dto/inout-history/update-inout-history.dto';
import { InOutHistoryFilterDto } from '../dto/inout-history/inout-history-filter.dto';
import { PaginatedResult } from 'src/common';

@Injectable()
export class InOutHistoryService {
  constructor(
    @InjectRepository(InOutHistory)
    private inOutHistoryRepository: Repository<InOutHistory>,
  ) {}

  async createInOutHistory(
    createInOutHistoryDto: CreateInOutHistoryDto,
  ): Promise<InOutHistory> {
    const inOutHistory = this.inOutHistoryRepository.create(
      createInOutHistoryDto,
    );
    return this.inOutHistoryRepository.save(inOutHistory);
  }

  async findAllInOutHistories(
    filterDto?: InOutHistoryFilterDto,
  ): Promise<PaginatedResult<InOutHistory>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      type,
      minQuantity,
      maxQuantity,
      startDate,
      endDate,
      partId,
      partDetailId,
      description,
    } = filterDto || {};

    const queryBuilder = this.createQueryBuilder();

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(inOutHistory.description ILIKE :search OR inOutHistory.type ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      queryBuilder.andWhere('inOutHistory.type = :type', { type });
    }

    if (minQuantity !== undefined) {
      queryBuilder.andWhere('inOutHistory.quantity >= :minQuantity', {
        minQuantity,
      });
    }

    if (maxQuantity !== undefined) {
      queryBuilder.andWhere('inOutHistory.quantity <= :maxQuantity', {
        maxQuantity,
      });
    }

    if (startDate) {
      queryBuilder.andWhere('DATE(inOutHistory.createdAt) >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('DATE(inOutHistory.createdAt) <= :endDate', {
        endDate,
      });
    }

    if (partId) {
      queryBuilder.andWhere('parts.id = :partId', { partId });
    }

    if (partDetailId) {
      queryBuilder.andWhere('partDetails.id = :partDetailId', { partDetailId });
    }

    if (description) {
      queryBuilder.andWhere('inOutHistory.description ILIKE :description', {
        description: `%${description}%`,
      });
    }

    // Apply sorting
    const validSortFields = ['quantity', 'type', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`inOutHistory.${sortField}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results
    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResult(data, total, page, limit);
  }

  async findAllInOutHistoriesSimple(): Promise<InOutHistory[]> {
    return this.inOutHistoryRepository.find({
      relations: ['parts', 'partDetails'],
    });
  }

  async findInOutHistoryById(id: string): Promise<InOutHistory | null> {
    return this.inOutHistoryRepository.findOne({
      where: { id },
      relations: ['parts', 'partDetails'],
    });
  }

  async updateInOutHistory(
    id: string,
    updateInOutHistoryDto: UpdateInOutHistoryDto,
  ): Promise<InOutHistory> {
    const existingInOutHistory = await this.findInOutHistoryById(id);
    if (!existingInOutHistory) {
      throw new NotFoundException(`InOutHistory with id ${id} not found`);
    }

    await this.inOutHistoryRepository.update(id, updateInOutHistoryDto);
    const inOutHistory = await this.findInOutHistoryById(id);
    return inOutHistory!;
  }

  async deleteInOutHistory(id: string): Promise<void> {
    const inOutHistory = await this.findInOutHistoryById(id);
    if (!inOutHistory) {
      throw new NotFoundException(`InOutHistory with id ${id} not found`);
    }
    await this.inOutHistoryRepository.delete(id);
  }

  // Helper methods
  private createQueryBuilder(): SelectQueryBuilder<InOutHistory> {
    return this.inOutHistoryRepository
      .createQueryBuilder('inOutHistory')
      .leftJoinAndSelect('inOutHistory.parts', 'parts')
      .leftJoinAndSelect('inOutHistory.partDetails', 'partDetails');
  }

  // Specific methods for InOutHistory
  async getInventoryReport(partId?: string): Promise<any> {
    const queryBuilder = this.inOutHistoryRepository
      .createQueryBuilder('inOutHistory')
      .leftJoin('inOutHistory.part', 'part')
      .select([
        'part.id as partId',
        'part.name as partName',
        "SUM(CASE WHEN inOutHistory.type IN ('NEW', 'IN', 'REPAIRED') THEN inOutHistory.quantity ELSE 0 END) as totalIn",
        "SUM(CASE WHEN inOutHistory.type IN ('OUT', 'SCRAP') THEN inOutHistory.quantity ELSE 0 END) as totalOut",
        "SUM(CASE WHEN inOutHistory.type IN ('NEW', 'IN', 'REPAIRED') THEN inOutHistory.quantity ELSE -inOutHistory.quantity END) as currentStock",
      ]);

    if (partId) {
      queryBuilder.where('part.id = :partId', { partId });
    }

    queryBuilder.groupBy('part.id, part.name');

    return queryBuilder.getRawMany();
  }

  async getHistoryByPart(partId: string): Promise<InOutHistory[]> {
    return this.inOutHistoryRepository.find({
      where: { part: { id: partId } },
      relations: ['part', 'partDetail'],
      order: { createdAt: 'DESC' },
    });
  }

  async getHistoryByPartDetail(partDetailId: string): Promise<InOutHistory[]> {
    return this.inOutHistoryRepository.find({
      where: { partDetail: { id: partDetailId } },
      relations: ['part', 'partDetail'],
      order: { createdAt: 'DESC' },
    });
  }
}
