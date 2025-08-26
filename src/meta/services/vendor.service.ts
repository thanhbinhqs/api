import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from '../entities/vendor.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateVendorDto } from '../dto/vendor/create-vendor.dto';
import { UpdateVendorDto } from '../dto/vendor/update-vendor.dto';
import { VendorFilterDto } from '../dto/vendor/vendor-filter.dto';
import { PaginatedResult } from 'src/common';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async createVendor(createVendorDto: CreateVendorDto): Promise<Vendor> {
    // Kiểm tra tính duy nhất của name và code
    await this.checkUniqueness(createVendorDto.name, createVendorDto.code);

    const vendor = this.vendorRepository.create(createVendorDto);
    return this.vendorRepository.save(vendor);
  }

  async findAllVendors(
    filterDto?: VendorFilterDto,
  ): Promise<PaginatedResult<Vendor>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      name,
      code,
      description,
    } = filterDto || {};

    const queryBuilder = this.createQueryBuilder();

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(vendor.name ILIKE :search OR vendor.code ILIKE :search OR vendor.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (name) {
      queryBuilder.andWhere('vendor.name ILIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('vendor.code ILIKE :code', { code: `%${code}%` });
    }

    if (description) {
      queryBuilder.andWhere('vendor.description ILIKE :description', {
        description: `%${description}%`,
      });
    }

    // Apply sorting
    const validSortFields = ['name', 'code', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`vendor.${sortField}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results
    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResult(data, total, page, limit);
  }

  async findAllVendorsSimple(): Promise<Vendor[]> {
    return this.vendorRepository.find();
  }

  async findVendorById(id: string): Promise<Vendor | null> {
    return this.vendorRepository.findOne({ where: { id } });
  }

  async updateVendor(
    id: string,
    updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    const existingVendor = await this.findVendorById(id);
    if (!existingVendor) {
      throw new NotFoundException(`Vendor with id ${id} not found`);
    }

    // Kiểm tra tính duy nhất của name và code (nếu có thay đổi)
    if (updateVendorDto.name || updateVendorDto.code) {
      await this.checkUniqueness(
        updateVendorDto.name || existingVendor.name,
        updateVendorDto.code || existingVendor.code,
        id,
      );
    }

    await this.vendorRepository.update(id, updateVendorDto);
    const vendor = await this.findVendorById(id);
    return vendor!;
  }

  async deleteVendor(id: string): Promise<void> {
    const vendor = await this.findVendorById(id);
    if (!vendor) {
      throw new NotFoundException(`Vendor with id ${id} not found`);
    }
    await this.vendorRepository.delete(id);
  }

  // Helper methods
  private createQueryBuilder(): SelectQueryBuilder<Vendor> {
    return this.vendorRepository.createQueryBuilder('vendor');
  }

  private async checkUniqueness(
    name: string,
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const queryBuilder = this.vendorRepository.createQueryBuilder('vendor');

    queryBuilder.where('(vendor.name = :name OR vendor.code = :code)', {
      name,
      code,
    });

    if (excludeId) {
      queryBuilder.andWhere('vendor.id != :excludeId', { excludeId });
    }

    const existingVendor = await queryBuilder.getOne();

    if (existingVendor) {
      if (existingVendor.name === name) {
        throw new ConflictException(`Vendor với tên "${name}" đã tồn tại`);
      }
      if (existingVendor.code === code) {
        throw new ConflictException(`Vendor với mã "${code}" đã tồn tại`);
      }
    }
  }

  async findVendorByCode(code: string): Promise<Vendor | null> {
    return this.vendorRepository.findOne({ where: { code } });
  }

  async findVendorsByName(name: string): Promise<Vendor[]> {
    return this.vendorRepository.find({
      where: { name: name },
    });
  }
}
