import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Project } from "../entities/project.entity";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CreateProjectDto } from "../dto/project/create-project.dto";
import { UpdateProjectDto } from "../dto/project/update-project.dto";
import { ProjectFilterDto } from "../dto/project/project-filter.dto";
import { PaginatedResult } from "src/common";

@Injectable()
export class ProjectService {

    constructor(
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
    ) {}

    async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
        // Kiểm tra tính duy nhất của name và slug
        await this.checkUniqueness(createProjectDto.name, createProjectDto.slug);
        
        const project = this.projectRepository.create(createProjectDto);
        return this.projectRepository.save(project);
    }

    async findAllProjects(filterDto?: ProjectFilterDto): Promise<PaginatedResult<Project>> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
            search,
            name,
            slug,
            friendlyName,
            code,
            description
        } = filterDto || {};

        const queryBuilder = this.createQueryBuilder();

        // Apply filters
        if (search) {
            queryBuilder.andWhere(
                '(project.name ILIKE :search OR project.slug ILIKE :search OR project.friendlyName ILIKE :search OR project.code ILIKE :search OR project.description ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (name) {
            queryBuilder.andWhere('project.name ILIKE :name', { name: `%${name}%` });
        }

        if (slug) {
            queryBuilder.andWhere('project.slug ILIKE :slug', { slug: `%${slug}%` });
        }

        if (friendlyName) {
            queryBuilder.andWhere('project.friendlyName ILIKE :friendlyName', { friendlyName: `%${friendlyName}%` });
        }

        if (code) {
            queryBuilder.andWhere('project.code ILIKE :code', { code: `%${code}%` });
        }

        if (description) {
            queryBuilder.andWhere('project.description ILIKE :description', { description: `%${description}%` });
        }

        // Apply sorting
        const validSortFields = ['name', 'slug', 'friendlyName', 'code', 'createdAt', 'updatedAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        queryBuilder.orderBy(`project.${sortField}`, sortOrder);

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        // Get results
        const [data, total] = await queryBuilder.getManyAndCount();
        
        return new PaginatedResult(data, total, page, limit);
    }

    async findAllProjectsSimple(): Promise<Project[]> {
        return this.projectRepository.find({
            relations: ['parts']
        });
    }

    async findProjectById(id: string): Promise<Project | null> {
        return this.projectRepository.findOne({ 
            where: { id },
            relations: ['parts']
        });
    }

    async updateProject(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
        const existingProject = await this.findProjectById(id);
        if (!existingProject) {
            throw new NotFoundException(`Project with id ${id} not found`);
        }

        // Kiểm tra tính duy nhất của name và slug (nếu có thay đổi)
        if (updateProjectDto.name || updateProjectDto.slug) {
            await this.checkUniqueness(
                updateProjectDto.name || existingProject.name,
                updateProjectDto.slug || existingProject.slug,
                id
            );
        }

        await this.projectRepository.update(id, updateProjectDto);
        const project = await this.findProjectById(id);
        return project!;
    }

    async deleteProject(id: string): Promise<void> {
        const project = await this.findProjectById(id);
        if (!project) {
            throw new NotFoundException(`Project with id ${id} not found`);
        }
        await this.projectRepository.delete(id);
    }

    // Helper methods
    private createQueryBuilder(): SelectQueryBuilder<Project> {
        return this.projectRepository
            .createQueryBuilder('project')
            .leftJoinAndSelect('project.parts', 'parts');
    }

    private async checkUniqueness(name: string, slug: string, excludeId?: string): Promise<void> {
        const queryBuilder = this.projectRepository.createQueryBuilder('project');
        
        queryBuilder.where('(project.name = :name OR project.slug = :slug)', { name, slug });
        
        if (excludeId) {
            queryBuilder.andWhere('project.id != :excludeId', { excludeId });
        }

        const existingProject = await queryBuilder.getOne();
        
        if (existingProject) {
            if (existingProject.name === name) {
                throw new ConflictException(`Project với tên "${name}" đã tồn tại`);
            }
            if (existingProject.slug === slug) {
                throw new ConflictException(`Project với slug "${slug}" đã tồn tại`);
            }
        }
    }

    async findProjectBySlug(slug: string): Promise<Project | null> {
        return this.projectRepository.findOne({ 
            where: { slug },
            relations: ['parts']
        });
    }
}
