import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, ILike } from 'typeorm';
import { CreateJigDto } from './dto/create-jig.dto';
import { UpdateJigDto } from './dto/update-jig.dto';
import { JigFilterDto } from './dto/jig-filter.dto';
import { Jig } from './entities/jig.entity';
import { PaginatedResult } from 'src/common/dto/paginated-result.dto';

@Injectable()
export class JigService {
  constructor(
    @InjectRepository(Jig)
    private readonly jigRepository: Repository<Jig>,
  ) {}

  async create(createJigDto: CreateJigDto): Promise<Jig> {
    try {
      const jig = this.jigRepository.create(createJigDto);
      return await this.jigRepository.save(jig);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new BadRequestException('Jig với code hoặc name này đã tồn tại');
      }
      throw error;
    }
  }

  async findAll(filterDto: JigFilterDto): Promise<PaginatedResult<Jig>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      name,
      code,
      mesCode,
      vendorId,
      projectId,
      processId,
      zoneId,
      type,
      needMaintenance,
      hasPart,
    } = filterDto;

    const queryBuilder = this.jigRepository.createQueryBuilder('jig')
      .leftJoinAndSelect('jig.vendor', 'vendor')
      .leftJoinAndSelect('jig.project', 'project')
      .leftJoinAndSelect('jig.process', 'process')
      .leftJoinAndSelect('jig.zone', 'zone')
      .leftJoinAndSelect('jig.details', 'details');

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(jig.name ILIKE :search OR jig.code ILIKE :search OR jig.mesCode ILIKE :search OR jig.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Filters
    if (name) {
      queryBuilder.andWhere('jig.name ILIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('jig.code ILIKE :code', { code: `%${code}%` });
    }

    if (mesCode) {
      queryBuilder.andWhere('jig.mesCode ILIKE :mesCode', { mesCode: `%${mesCode}%` });
    }

    if (vendorId) {
      queryBuilder.andWhere('jig.vendorId = :vendorId', { vendorId });
    }

    if (projectId) {
      queryBuilder.andWhere('jig.projectId = :projectId', { projectId });
    }

    if (processId) {
      queryBuilder.andWhere('jig.processId = :processId', { processId });
    }

    if (zoneId) {
      queryBuilder.andWhere('jig.zoneId = :zoneId', { zoneId });
    }

    if (type) {
      queryBuilder.andWhere('jig.type = :type', { type });
    }

    if (needMaintenance !== undefined) {
      queryBuilder.andWhere('jig.needMaintenance = :needMaintenance', { needMaintenance });
    }

    if (hasPart !== undefined) {
      queryBuilder.andWhere('jig.hasPart = :hasPart', { hasPart });
    }

    // Sorting
    queryBuilder.orderBy(`jig.${sortBy}`, sortOrder);

    // Pagination
    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResult(items, total, page, limit);
  }

  async findOne(id: string): Promise<Jig> {
    const jig = await this.jigRepository.findOne({
      where: { id },
      relations: [
        'vendor',
        'project',
        'process',
        'zone',
        'details',
        'details.location',
        'details.line',
        'details.vendor',
        'details.partDetails',
        'parts'
      ],
    });

    if (!jig) {
      throw new NotFoundException(`Không tìm thấy jig với ID ${id}`);
    }

    return jig;
  }

  async update(id: string, updateJigDto: UpdateJigDto): Promise<Jig> {
    const jig = await this.findOne(id);
    
    try {
      Object.assign(jig, updateJigDto);
      return await this.jigRepository.save(jig);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new BadRequestException('Jig với code hoặc name này đã tồn tại');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const jig = await this.findOne(id);
    await this.jigRepository.remove(jig);
  }

  async findByCode(code: string): Promise<Jig | null> {
    return await this.jigRepository.findOne({
      where: { code },
      relations: ['vendor', 'project', 'process', 'zone', 'details'],
    });
  }

  async findByMesCode(mesCode: string): Promise<Jig | null> {
    return await this.jigRepository.findOne({
      where: { mesCode },
      relations: ['vendor', 'project', 'process', 'zone', 'details'],
    });
  }

  async getJigsNeedingMaintenance(): Promise<Jig[]> {
    return await this.jigRepository.find({
      where: { needMaintenance: true },
      relations: ['details'],
    });
  }
}
