import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UploadFile } from './file.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class FileShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @ManyToOne(() => UploadFile)
  @JoinColumn()
  file: UploadFile;

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @Column({ type: 'varchar', nullable: true })
  password?: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ nullable: true })
  maxDownloads?: number;

  @Column({ default: 0 })
  downloadCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
