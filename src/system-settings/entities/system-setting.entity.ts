import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { SystemSettingKey } from '../../common/constants/system-settings.constants';

@Entity()
export class SystemSetting {
  @PrimaryColumn({
    length: 100,
    type: 'varchar',
    transformer: {
      to: (value: SystemSettingKey) => value,
      from: (value) => value || [],
    },
  })
  key: string;

  @Column('json')
  value: any;

  @Column({ default: '1.0.0' })
  version: string;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;
}
