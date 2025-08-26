import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from '../entities/location.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateLocationDto } from '../dto/location/create-location.dto';
import { UpdateLocationDto } from '../dto/location/update-location.dto';
import { LocationFilterDto } from '../dto/location/location-filter.dto';
import { PaginatedResult } from 'src/common';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async createLocation(
    createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    // Kiểm tra tính duy nhất của name và code
    await this.checkUniqueness(createLocationDto.name, createLocationDto.code);

    const location = this.locationRepository.create(createLocationDto);
    return this.locationRepository.save(location);
  }

  async findAllLocations(
    filterDto?: LocationFilterDto,
  ): Promise<PaginatedResult<Location>> {
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
        '(location.name ILIKE :search OR location.code ILIKE :search OR location.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (name) {
      queryBuilder.andWhere('location.name ILIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('location.code ILIKE :code', { code: `%${code}%` });
    }

    if (description) {
      queryBuilder.andWhere('location.description ILIKE :description', {
        description: `%${description}%`,
      });
    }

    // Apply sorting
    const validSortFields = ['name', 'code', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`location.${sortField}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results
    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResult(data, total, page, limit);
  }

  async findAllLocationsSimple(): Promise<Location[]> {
    return this.locationRepository.find();
  }

  async findLocationById(id: string): Promise<Location | null> {
    return this.locationRepository.findOne({ where: { id } });
  }

  async updateLocation(
    id: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const existingLocation = await this.findLocationById(id);
    if (!existingLocation) {
      throw new NotFoundException(`Location with id ${id} not found`);
    }

    // Kiểm tra tính duy nhất của name và code (nếu có thay đổi)
    if (updateLocationDto.name || updateLocationDto.code) {
      await this.checkUniqueness(
        updateLocationDto.name || existingLocation.name,
        updateLocationDto.code || existingLocation.code,
        id,
      );
    }

    await this.locationRepository.update(id, updateLocationDto);
    const location = await this.findLocationById(id);
    return location!;
  }

  async deleteLocation(id: string): Promise<void> {
    const location = await this.findLocationById(id);
    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found`);
    }
    await this.locationRepository.delete(id);
  }

  // Helper methods
  private createQueryBuilder(): SelectQueryBuilder<Location> {
    return this.locationRepository.createQueryBuilder('location');
  }

  private async checkUniqueness(
    name: string,
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const queryBuilder = this.locationRepository.createQueryBuilder('location');

    queryBuilder.where('(location.name = :name OR location.code = :code)', {
      name,
      code,
    });

    if (excludeId) {
      queryBuilder.andWhere('location.id != :excludeId', { excludeId });
    }

    const existingLocation = await queryBuilder.getOne();

    if (existingLocation) {
      if (existingLocation.name === name) {
        throw new ConflictException(`Location với tên "${name}" đã tồn tại`);
      }
      if (existingLocation.code === code) {
        throw new ConflictException(`Location với mã "${code}" đã tồn tại`);
      }
    }
  }

  async findLocationByCode(code: string): Promise<Location | null> {
    return this.locationRepository.findOne({ where: { code } });
  }

  async findLocationsByName(name: string): Promise<Location[]> {
    return this.locationRepository.find({
      where: { name: name },
    });
  }
}
