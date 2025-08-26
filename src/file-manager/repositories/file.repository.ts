import { Repository } from 'typeorm';
import { UploadFile } from '../entities/file.entity';
import { User } from '../../user/entities/user.entity';
import { DataSource } from 'typeorm';

export class FileRepository extends Repository<UploadFile> {
  constructor(private dataSource: DataSource) {
    super(UploadFile, dataSource.createEntityManager());
  }
  async findUserFiles(user: User | null): Promise<UploadFile[]> {
    const query = this.createQueryBuilder('file').leftJoinAndSelect(
      'file.owner',
      'owner',
    );

    if (user) {
      query.where('file.ownerId = :userId OR file.isPublic = true', {
        userId: user.id,
      });
    } else {
      query.where('file.isPublic = true');
    }

    return query.getMany();
  }

  async findById(id: string, user?: User | null): Promise<UploadFile | null> {
    const query = this.createQueryBuilder('file').where('file.id = :id', {
      id,
    });

    if (user) {
      query.andWhere('(file.ownerId = :userId OR file.isPublic = true)', {
        userId: user.id,
      });
    } else {
      query.andWhere('file.isPublic = true');
    }

    return query.getOne();
  }
}
