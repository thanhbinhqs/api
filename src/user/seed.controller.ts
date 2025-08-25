import { Controller, Get, Post } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from 'src/common/enums/permission.enum';
import { Utils } from 'src/common/services/utils';

@Controller('users')
export class SeedController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private dataSource: DataSource,
  ) {}

  @Get()
  async seed() {
    try {
      const roles = await this.roleRepository.find();
      const permissions = Object.values(Permission);
      const password = Utils.hashedPassword('1234567890');

      //seed admin user
      let admin = await this.userRepository.findOne({
        where: {
          username: 'admin',
        },
      });
      if (!admin)
        admin = await this.userRepository.save({
          username: 'admin',
          email: 'admin@admin.com',
          password,
          roles: [],
          permissions: permissions,
        });

      //seed users
      const users: any = [];
      for (let i = 0; i < 300; i++) {
        const user = faker.internet.username();
        let as = await this.userRepository.findOne({
          where: {
            username: user.toString(),
          },
        });
        if (as) continue;
        const u = {
          username: user.toString(),
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          password,
          roles: [roles[i % roles.length]],
        };
        await this.userRepository.save(u);
      }
    } catch (error) {
      console.log(error.message);
    }
    return { message: 'Seeded successfully' };
  }
}
