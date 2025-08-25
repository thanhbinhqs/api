import { Repository } from 'typeorm';
import { FileShare } from '../entities/file-share.entity';
import { DataSource } from 'typeorm';

export class FileShareRepository extends Repository<FileShare> {
  constructor(private dataSource: DataSource) {
    super(FileShare, dataSource.createEntityManager());
  }
  async findByToken(token: string): Promise<FileShare | null> {
    return this.createQueryBuilder('share')
      .leftJoinAndSelect('share.file', 'file')
      .leftJoinAndSelect('share.createdBy', 'createdBy')
      .where('share.token = :token', { token })
      .getOne();
  }

  async isValidShare(share: FileShare): Promise<boolean> {
    if (share.expiresAt && new Date() > share.expiresAt) {
      return false;
    }
    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      return false;
    }
    return true;
  }

  async incrementDownloadCount(share: FileShare): Promise<void> {
    await this.update(share.id, {
      downloadCount: share.downloadCount + 1
    });
  }
}
