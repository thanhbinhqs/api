import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Line } from '../entities/line.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateLineDto } from '../dto/line/create-line.dto';
import { UpdateLineDto } from '../dto/line/update-line.dto';
import { LineFilterDto } from '../dto/line/line-filter.dto';
import { PaginatedResult } from 'src/common';

@Injectable()
export class LineService {
  constructor(
    @InjectRepository(Line)
    private lineRepository: Repository<Line>,
  ) {}

  async createLine(createLineDto: CreateLineDto): Promise<Line> {
    // Kiểm tra tính duy nhất của name và slug
    await this.checkUniqueness(createLineDto.name, createLineDto.slug);

    const line = this.lineRepository.create(createLineDto);
    return this.lineRepository.save(line);
  }

  async findAllLines(
    filterDto?: LineFilterDto,
  ): Promise<PaginatedResult<Line>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      name,
      slug,
      code,
      description,
      zoneId,
    } = filterDto || {};

    const queryBuilder = this.createQueryBuilder();

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(line.name ILIKE :search OR line.slug ILIKE :search OR line.code ILIKE :search OR line.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (name) {
      queryBuilder.andWhere('line.name ILIKE :name', { name: `%${name}%` });
    }

    if (slug) {
      queryBuilder.andWhere('line.slug ILIKE :slug', { slug: `%${slug}%` });
    }

    if (code) {
      queryBuilder.andWhere('line.code ILIKE :code', { code: `%${code}%` });
    }

    if (description) {
      queryBuilder.andWhere('line.description ILIKE :description', {
        description: `%${description}%`,
      });
    }

    if (zoneId) {
      queryBuilder.andWhere('line.zoneId = :zoneId', { zoneId });
    }

    // Apply sorting
    const validSortFields = ['name', 'slug', 'code', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`line.${sortField}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results
    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResult(data, total, page, limit);
  }

  async findAllLinesSimple(): Promise<Line[]> {
    return this.lineRepository.find({
      relations: ['zone'],
    });
  }

  async findLineById(id: string): Promise<Line | null> {
    return this.lineRepository.findOne({
      where: { id },
      relations: ['zone'],
    });
  }

  async updateLine(id: string, updateLineDto: UpdateLineDto): Promise<Line> {
    const existingLine = await this.findLineById(id);
    if (!existingLine) {
      throw new NotFoundException(`Line with id ${id} not found`);
    }

    // Kiểm tra tính duy nhất của name và slug (nếu có thay đổi)
    if (updateLineDto.name || updateLineDto.slug) {
      await this.checkUniqueness(
        updateLineDto.name || existingLine.name,
        updateLineDto.slug || existingLine.slug,
        id,
      );
    }

    await this.lineRepository.update(id, updateLineDto);
    const line = await this.findLineById(id);
    return line!;
  }

  async deleteLine(id: string): Promise<void> {
    const line = await this.findLineById(id);
    if (!line) {
      throw new NotFoundException(`Line with id ${id} not found`);
    }
    await this.lineRepository.delete(id);
  }

  // Helper methods
  private createQueryBuilder(): SelectQueryBuilder<Line> {
    return this.lineRepository
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.zone', 'zone');
  }

  private async checkUniqueness(
    name: string,
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const queryBuilder = this.lineRepository.createQueryBuilder('line');

    queryBuilder.where('(line.name = :name OR line.slug = :slug)', {
      name,
      slug,
    });

    if (excludeId) {
      queryBuilder.andWhere('line.id != :excludeId', { excludeId });
    }

    const existingLine = await queryBuilder.getOne();

    if (existingLine) {
      if (existingLine.name === name) {
        throw new ConflictException(`Line với tên "${name}" đã tồn tại`);
      }
      if (existingLine.slug === slug) {
        throw new ConflictException(`Line với slug "${slug}" đã tồn tại`);
      }
    }
  }

  async findLineBySlug(slug: string): Promise<Line | null> {
    return this.lineRepository.findOne({
      where: { slug },
      relations: ['zone'],
    });
  }

  async findLinesByZone(zoneId: string): Promise<Line[]> {
    return this.lineRepository.find({
      where: { zone: { id: zoneId } },
      relations: ['zone'],
    });
  }
}
