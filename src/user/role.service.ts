import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create({
      ...createRoleDto,
      permissions: createRoleDto.permissions || [],
    });
    return this.roleRepository.save(role);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    sort?: { field: string; order: 'ASC' | 'DESC' },
    filter?: Partial<Role>,
  ): Promise<{ data: Role[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = this.roleRepository.createQueryBuilder('role');

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          query.andWhere(`role.${key} = :${key}`, { [key]: value });
        }
      });
    }

    if (sort) {
      query.orderBy(`role.${sort.field}`, sort.order);
    }

    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Role> {
    return this.roleRepository.findOneOrFail({ where: { id } });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    await this.roleRepository.update(id, {
      ...updateRoleDto,
      permissions: updateRoleDto.permissions || [],
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }
}
