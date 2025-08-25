import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Process } from "../entities/process.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CreateProcessDto } from "../dto/process/create-process.dto";
import { UpdateProcessDto } from "../dto/process/update-process.dto";
import { ProcessFilterDto } from "../dto/process/process-filter.dto";
import { PaginatedResult } from "src/common";

@Injectable()
export class ProcessService {

    constructor(
        @InjectRepository(Process)
        private processRepository: Repository<Process>,
    ) {}

    async createProcess(createProcessDto: CreateProcessDto): Promise<Process> {
        // Kiểm tra tính duy nhất của name và slug
        await this.checkUniqueness(createProcessDto.name, createProcessDto.slug);
        
        const process = this.processRepository.create(createProcessDto);
        return this.processRepository.save(process);
    }

    async findAllProcesses(filterDto?: ProcessFilterDto): Promise<PaginatedResult<Process>> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
            search,
            name,
            slug,
            code,
            description
        } = filterDto || {};

        const queryBuilder = this.createQueryBuilder();

        // Apply filters
        if (search) {
            queryBuilder.andWhere(
                '(process.name ILIKE :search OR process.slug ILIKE :search OR process.code ILIKE :search OR process.description ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (name) {
            queryBuilder.andWhere('process.name ILIKE :name', { name: `%${name}%` });
        }

        if (slug) {
            queryBuilder.andWhere('process.slug ILIKE :slug', { slug: `%${slug}%` });
        }

        if (code) {
            queryBuilder.andWhere('process.code ILIKE :code', { code: `%${code}%` });
        }

        if (description) {
            queryBuilder.andWhere('process.description ILIKE :description', { description: `%${description}%` });
        }

        // Apply sorting
        const validSortFields = ['name', 'slug', 'code', 'createdAt', 'updatedAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        queryBuilder.orderBy(`process.${sortField}`, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        // Get results
        const [data, total] = await queryBuilder.getManyAndCount();
        
        return new PaginatedResult(data, total, page, limit);
    }

    async findAllProcessesSimple(): Promise<Process[]> {
        return this.processRepository.find();
    }

    async findProcessById(id: string): Promise<Process | null> {
        return this.processRepository.findOne({ where: { id } });
    }

    async updateProcess(id: string, updateProcessDto: UpdateProcessDto): Promise<Process> {
        const existingProcess = await this.findProcessById(id);
        if (!existingProcess) {
            throw new NotFoundException(`Process with id ${id} not found`);
        }

        // Kiểm tra tính duy nhất của name và slug (nếu có thay đổi)
        if (updateProcessDto.name || updateProcessDto.slug) {
            await this.checkUniqueness(
                updateProcessDto.name || existingProcess.name,
                updateProcessDto.slug || existingProcess.slug,
                id
            );
        }

        await this.processRepository.update(id, updateProcessDto);
        const process = await this.findProcessById(id);
        return process!;
    }

    async deleteProcess(id: string): Promise<void> {
        const process = await this.findProcessById(id);
        if (!process) {
            throw new NotFoundException(`Process with id ${id} not found`);
        }
        await this.processRepository.delete(id);
    }

    // Helper methods
    private createQueryBuilder(): SelectQueryBuilder<Process> {
        return this.processRepository.createQueryBuilder('process');
    }

    private async checkUniqueness(name: string, slug: string, excludeId?: string): Promise<void> {
        const queryBuilder = this.processRepository.createQueryBuilder('process');
        
        queryBuilder.where('(process.name = :name OR process.slug = :slug)', { name, slug });
        
        if (excludeId) {
            queryBuilder.andWhere('process.id != :excludeId', { excludeId });
        }

        const existingProcess = await queryBuilder.getOne();
        
        if (existingProcess) {
            if (existingProcess.name === name) {
                throw new ConflictException(`Process với tên "${name}" đã tồn tại`);
            }
            if (existingProcess.slug === slug) {
                throw new ConflictException(`Process với slug "${slug}" đã tồn tại`);
            }
        }
    }

    async findProcessBySlug(slug: string): Promise<Process | null> {
        return this.processRepository.findOne({ where: { slug } });
    }
}
