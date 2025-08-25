import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between } from 'typeorm';
import { JigDrawing } from './entities/jig-drawing.entity';
import { CreateJigDrawingDto } from './dto/create-jig-drawing.dto';
import { UpdateJigDrawingDto } from './dto/update-jig-drawing.dto';
import { JigDrawingFilterDto } from './dto/jig-drawing-filter.dto';
import { JigService } from './jig.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JigDrawingService {
    constructor(
        @InjectRepository(JigDrawing)
        private readonly jigDrawingRepository: Repository<JigDrawing>,
        private readonly jigService: JigService,
    ) {}

    async create(createJigDrawingDto: CreateJigDrawingDto): Promise<JigDrawing> {
        // Kiểm tra Jig có tồn tại không
        const jig = await this.jigService.findOne(createJigDrawingDto.jigId);
        if (!jig) {
            throw new NotFoundException(`Jig với ID ${createJigDrawingDto.jigId} không tồn tại`);
        }

        // Kiểm tra file có tồn tại không
        if (!fs.existsSync(createJigDrawingDto.filePath)) {
            throw new BadRequestException('File không tồn tại');
        }

        const { jigId, ...drawingData } = createJigDrawingDto;
        const jigDrawing = this.jigDrawingRepository.create({
            ...drawingData,
            jig: jig,
        });
        
        return await this.jigDrawingRepository.save(jigDrawing);
    }

    async findAll(filterDto: JigDrawingFilterDto): Promise<{
        data: JigDrawing[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', ...filters } = filterDto;
        
        const queryBuilder = this.jigDrawingRepository.createQueryBuilder('jigDrawing')
            .leftJoinAndSelect('jigDrawing.jig', 'jig');

        // Apply filters
        if (filters.name) {
            queryBuilder.andWhere('jigDrawing.name ILIKE :name', { name: `%${filters.name}%` });
        }

        if (filters.jigId) {
            queryBuilder.andWhere('jig.id = :jigId', { jigId: filters.jigId });
        }

        if (filters.drawingType) {
            queryBuilder.andWhere('jigDrawing.drawingType = :drawingType', { drawingType: filters.drawingType });
        }

        if (filters.fileFormat) {
            queryBuilder.andWhere('jigDrawing.fileFormat = :fileFormat', { fileFormat: filters.fileFormat });
        }

        if (filters.status) {
            queryBuilder.andWhere('jigDrawing.status = :status', { status: filters.status });
        }

        if (filters.drawingVersion) {
            queryBuilder.andWhere('jigDrawing.drawingVersion = :drawingVersion', { drawingVersion: filters.drawingVersion });
        }

        if (filters.drawingNumber) {
            queryBuilder.andWhere('jigDrawing.drawingNumber ILIKE :drawingNumber', { drawingNumber: `%${filters.drawingNumber}%` });
        }

        if (filters.revision) {
            queryBuilder.andWhere('jigDrawing.revision = :revision', { revision: filters.revision });
        }

        if (filters.createdFrom && filters.createdTo) {
            queryBuilder.andWhere('jigDrawing.createdAt BETWEEN :createdFrom AND :createdTo', {
                createdFrom: filters.createdFrom,
                createdTo: filters.createdTo,
            });
        } else if (filters.createdFrom) {
            queryBuilder.andWhere('jigDrawing.createdAt >= :createdFrom', { createdFrom: filters.createdFrom });
        } else if (filters.createdTo) {
            queryBuilder.andWhere('jigDrawing.createdAt <= :createdTo', { createdTo: filters.createdTo });
        }

        // Apply sorting
        queryBuilder.orderBy(`jigDrawing.${sortBy}`, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findOne(id: string): Promise<JigDrawing> {
        const jigDrawing = await this.jigDrawingRepository.findOne({
            where: { id },
            relations: ['jig'],
        });

        if (!jigDrawing) {
            throw new NotFoundException(`Bản vẽ Jig với ID ${id} không tồn tại`);
        }

        return jigDrawing;
    }

    async findByJigId(jigId: string): Promise<JigDrawing[]> {
        return await this.jigDrawingRepository.find({
            where: { jig: { id: jigId } },
            relations: ['jig'],
            order: { createdAt: 'DESC' },
        });
    }

    async update(id: string, updateJigDrawingDto: UpdateJigDrawingDto): Promise<JigDrawing> {
        const jigDrawing = await this.findOne(id);

        // Nếu có thay đổi jigId, kiểm tra Jig mới có tồn tại không
        if (updateJigDrawingDto.jigId && updateJigDrawingDto.jigId !== jigDrawing.jig?.id) {
            const newJig = await this.jigService.findOne(updateJigDrawingDto.jigId);
            if (!newJig) {
                throw new NotFoundException(`Jig với ID ${updateJigDrawingDto.jigId} không tồn tại`);
            }
            jigDrawing.jig = newJig;
        }

        // Nếu có thay đổi filePath, kiểm tra file mới có tồn tại không
        if (updateJigDrawingDto.filePath && updateJigDrawingDto.filePath !== jigDrawing.filePath) {
            if (!fs.existsSync(updateJigDrawingDto.filePath)) {
                throw new BadRequestException('File mới không tồn tại');
            }
        }

        // Loại bỏ jigId khỏi updateDto vì đã xử lý riêng
        const { jigId, ...updateData } = updateJigDrawingDto;
        Object.assign(jigDrawing, updateData);
        return await this.jigDrawingRepository.save(jigDrawing);
    }

    async remove(id: string): Promise<void> {
        const jigDrawing = await this.findOne(id);
        
        // Soft delete
        jigDrawing.isDeleted = true;
        jigDrawing.deletedAt = new Date();
        await this.jigDrawingRepository.save(jigDrawing);
    }

    async approve(id: string, approvedBy: string): Promise<JigDrawing> {
        const jigDrawing = await this.findOne(id);
        
        jigDrawing.status = 'approved';
        jigDrawing.approvedAt = new Date();
        jigDrawing.approvedBy = approvedBy;
        
        return await this.jigDrawingRepository.save(jigDrawing);
    }

    async reject(id: string, notes?: string): Promise<JigDrawing> {
        const jigDrawing = await this.findOne(id);
        
        jigDrawing.status = 'rejected';
        if (notes) {
            jigDrawing.notes = notes;
        }
        
        return await this.jigDrawingRepository.save(jigDrawing);
    }

    async getLatestVersion(jigId: string, drawingNumber?: string): Promise<JigDrawing | null> {
        const queryBuilder = this.jigDrawingRepository.createQueryBuilder('jigDrawing')
            .leftJoinAndSelect('jigDrawing.jig', 'jig')
            .where('jig.id = :jigId', { jigId })
            .andWhere('jigDrawing.status = :status', { status: 'approved' });

        if (drawingNumber) {
            queryBuilder.andWhere('jigDrawing.drawingNumber = :drawingNumber', { drawingNumber });
        }

        return await queryBuilder
            .orderBy('jigDrawing.drawingVersion', 'DESC')
            .addOrderBy('jigDrawing.revision', 'DESC')
            .getOne();
    }

    async getVersionHistory(jigId: string, drawingNumber?: string): Promise<JigDrawing[]> {
        const queryBuilder = this.jigDrawingRepository.createQueryBuilder('jigDrawing')
            .leftJoinAndSelect('jigDrawing.jig', 'jig')
            .where('jig.id = :jigId', { jigId });

        if (drawingNumber) {
            queryBuilder.andWhere('jigDrawing.drawingNumber = :drawingNumber', { drawingNumber });
        }

        return await queryBuilder
            .orderBy('jigDrawing.drawingVersion', 'DESC')
            .addOrderBy('jigDrawing.revision', 'DESC')
            .addOrderBy('jigDrawing.createdAt', 'DESC')
            .getMany();
    }
}
