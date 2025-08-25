import { BaseEntity } from 'src/common/entities/base-entity';
import { Permission } from 'src/common/enums/permission.enum';
import { Column, Entity, ManyToMany } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 150, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'jsonb',
    default: [],
    nullable: true,
    transformer: {
      to: (value: Permission[]) => value,
      from: (value) => value || [],
    },
  })
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
