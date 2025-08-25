import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Zone } from "../entities/zone.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CreateZoneDto } from "../dto/zone/create-zone.dto";
import { UpdateZoneDto } from "../dto/zone/update-zone.dto";
import { ZoneFilterDto } from "../dto/zone/zone-filter.dto";
import { PaginatedResult } from "src/common";

@Injectable()
export class ZoneService {

    constructor(
        @InjectRepository(Zone)
        private zoneRepository: Repository<Zone>,
    ) {}

    async createZone(createZoneDto: CreateZoneDto): Promise<Zone> {
        // Kiểm tra tính duy nhất của name và slug
        await this.checkUniqueness(createZoneDto.name, createZoneDto.slug);
        
        const zone = this.zoneRepository.create(createZoneDto);
        return this.zoneRepository.save(zone);
    }

    async findAllZones(filterDto?: ZoneFilterDto): Promise<PaginatedResult<Zone>> {
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
            parentZoneId
        } = filterDto || {};

        const queryBuilder = this.createQueryBuilder();

        // Apply filters
        if (search) {
            queryBuilder.andWhere(
                '(zone.name ILIKE :search OR zone.slug ILIKE :search OR zone.code ILIKE :search OR zone.description ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (name) {
            queryBuilder.andWhere('zone.name ILIKE :name', { name: `%${name}%` });
        }

        if (slug) {
            queryBuilder.andWhere('zone.slug ILIKE :slug', { slug: `%${slug}%` });
        }

        if (code) {
            queryBuilder.andWhere('zone.code ILIKE :code', { code: `%${code}%` });
        }

        if (description) {
            queryBuilder.andWhere('zone.description ILIKE :description', { description: `%${description}%` });
        }

        if (parentZoneId) {
            queryBuilder.andWhere('zone.parentZoneId = :parentZoneId', { parentZoneId });
        }

        // Apply sorting
        const validSortFields = ['name', 'slug', 'code', 'createdAt', 'updatedAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        queryBuilder.orderBy(`zone.${sortField}`, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        // Get results
        const [data, total] = await queryBuilder.getManyAndCount();
        
        return new PaginatedResult(data, total, page, limit);
    }

    async findAllZonesSimple(): Promise<Zone[]> {
        return this.zoneRepository.find({
            relations: ['parentZone', 'children']
        });
    }

    async findZoneById(id: string): Promise<Zone | null> {
        return this.zoneRepository.findOne({ where: { id } });
    }

    async updateZone(id: string, updateZoneDto: UpdateZoneDto): Promise<Zone> {
        const existingZone = await this.findZoneById(id);
        if (!existingZone) {
            throw new NotFoundException(`Zone with id ${id} not found`);
        }

        // Kiểm tra tính duy nhất của name và slug (nếu có thay đổi)
        if (updateZoneDto.name || updateZoneDto.slug) {
            await this.checkUniqueness(
                updateZoneDto.name || existingZone.name,
                updateZoneDto.slug || existingZone.slug,
                id
            );
        }

        await this.zoneRepository.update(id, updateZoneDto);
        const zone = await this.findZoneById(id);
        return zone!;
    }

    async deleteZone(id: string): Promise<void> {
        const zone = await this.findZoneById(id);
        if (!zone) {
            throw new NotFoundException(`Zone with id ${id} not found`);
        }
        await this.zoneRepository.delete(id);
    }

    // Helper methods
    private createQueryBuilder(): SelectQueryBuilder<Zone> {
        return this.zoneRepository
            .createQueryBuilder('zone')
            .leftJoinAndSelect('zone.parentZone', 'parentZone')
            .leftJoinAndSelect('zone.children', 'children')
            .leftJoinAndSelect('zone.lines', 'lines');
    }

    private async checkUniqueness(name: string, slug: string, excludeId?: string): Promise<void> {
        const queryBuilder = this.zoneRepository.createQueryBuilder('zone');
        
        queryBuilder.where('(zone.name = :name OR zone.slug = :slug)', { name, slug });
        
        if (excludeId) {
            queryBuilder.andWhere('zone.id != :excludeId', { excludeId });
        }

        const existingZone = await queryBuilder.getOne();
        
        if (existingZone) {
            if (existingZone.name === name) {
                throw new ConflictException(`Zone với tên "${name}" đã tồn tại`);
            }
            if (existingZone.slug === slug) {
                throw new ConflictException(`Zone với slug "${slug}" đã tồn tại`);
            }
        }
    }

    async findZoneBySlug(slug: string): Promise<Zone | null> {
        return this.zoneRepository.findOne({ 
            where: { slug },
            relations: ['parentZone', 'children', 'lines']
        });
    }

    async findZonesByParent(parentZoneId: string): Promise<Zone[]> {
        return this.zoneRepository.find({
            where: { parentZone: { id: parentZoneId } },
            relations: ['children', 'lines']
        });
    }

    async getZoneHierarchy(id: string): Promise<Zone[]> {
        const zone = await this.zoneRepository.findOne({
            where: { id },
            relations: ['parentZone']
        });
        
        if (!zone) {
            throw new NotFoundException(`Zone with id ${id} not found`);
        }

        const hierarchy: Zone[] = [zone];
        let currentZone = zone;

        // Đi ngược lên để tìm các zone cha
        while (currentZone.parentZone) {
            const parent = await this.zoneRepository.findOne({
                where: { id: currentZone.parentZone.id },
                relations: ['parentZone']
            });
            if (parent) {
                hierarchy.unshift(parent);
                currentZone = parent;
            } else {
                break;
            }
        }

        return hierarchy;
    }
}