import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tableName: string;

  @Column('jsonb')
  oldValue: any;

  @Column('jsonb')
  newValue: any;

  @Column()
  action: 'INSERT' | 'UPDATE' | 'DELETE';

  @Column()
  userId: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column()
  createdAt: Date = new Date();
}
