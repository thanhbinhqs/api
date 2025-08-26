import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileRepository } from './repositories/file.repository';
import { FileShareRepository } from './repositories/file-share.repository';
import { UploadFile } from './entities/file.entity';
import { FileShare } from './entities/file-share.entity';
import { User } from '../user/entities/user.entity';
import * as crypto from 'crypto';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';

@Injectable()
export class FileManagerService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly fileShareRepository: FileShareRepository,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    user: User | null,
    chunkIndex: number = 0,
    totalChunks: number = 1,
    fileId: string = '',
    resumeCheck: number = -1,
    fileName: string = '',
    size: number | string = 0,
  ): Promise<any> {
    const baseStoragePath = user
      ? path.join('storage', 'private', user.id)
      : path.join('storage', 'public');

    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(baseStoragePath)) {
      fs.mkdirSync(baseStoragePath, { recursive: true });
    }
    //console.log('Uploaded chunk: ' + chunkIndex + '==> ' + totalChunks);
    // Kiểm tra resume check
    if (+resumeCheck > -1) {
      if (!fileId || fileId.length !== 32) {
        throw new BadRequestException('File ID is required for resume check');
      }

      if (!size || +size <= 0) {
        throw new BadRequestException('File size is required for resume check');
      }

      const tempFilePath = path.join(baseStoragePath, `${fileId}.temp`);
      if (!fs.existsSync(tempFilePath)) {
        throw new BadRequestException('File not found for resume check');
      }

      const fileSize = fs.statSync(tempFilePath).size;
      const chunkSize = Math.ceil(+size / +totalChunks);
      const currentChunk = Math.floor(fileSize / chunkSize);

      return {
        chunkIndex: currentChunk,
        fileId,
      };
    }

    if (chunkIndex == 0) {
      fileId = crypto.randomBytes(16).toString('hex');
      const tempFilePath = path.join(baseStoragePath, `${fileId}.temp`);
      fs.writeFileSync(tempFilePath, file.buffer);
      return {
        fileId,
        chunkIndex,
      };
    } else {
      if (!fileId || fileId.length != 32) {
        throw new BadRequestException('File ID is required for resume check');
      }
      const tempFilePath = path.join(baseStoragePath, `${fileId}.temp`);
      //check last chunk with existing file
      const fileSize = fs.statSync(tempFilePath).size;
      const currentChunk = Math.floor(fileSize / file.size);
      if (currentChunk != chunkIndex && chunkIndex + 1 == totalChunks) {
        throw new BadRequestException('Invalid chunk index');
      }
      fs.appendFileSync(tempFilePath, file.buffer);
      const result = +chunkIndex + 1 == +totalChunks;
      if (result) {
        const filePath = path.join(baseStoragePath, fileId + '_' + fileName);
        fs.renameSync(tempFilePath, filePath);
        const totalSize = fs.statSync(filePath).size;
        let fileEntity = new UploadFile();
        fileEntity.name = fileId + '_' + fileName;
        fileEntity.path = filePath;
        fileEntity.size = totalSize;
        fileEntity.mimeType = file.mimetype;
        fileEntity.owner = user;
        fileEntity.isPublic = !user;
        fileEntity.createdAt = new Date();

        fileEntity = await this.fileRepository.save(fileEntity);

        return {
          ...fileEntity,
          fileId,
        };
      }
      return {
        fileId,
        chunkIndex,
      };
    }
  }

  async getFiles(user: User | null): Promise<UploadFile[]> {
    return this.fileRepository.findUserFiles(user);
  }

  async createShare(
    fileId: string,
    user: User,
    options?: {
      password?: string;
      expiresAt?: Date;
      maxDownloads?: number;
    },
  ): Promise<FileShare> {
    const file = await this.fileRepository.findById(fileId, user);
    if (!file) {
      throw new Error('File not found');
    }

    const share = new FileShare();
    share.file = file;
    share.createdBy = user;
    share.token = crypto.randomBytes(16).toString('hex');
    share.password = options?.password;
    share.expiresAt = options?.expiresAt;
    share.maxDownloads = options?.maxDownloads;

    return this.fileShareRepository.save(share);
  }

  async downloadFile(
    fileId: string,
    user: User | null,
    res: Response,
  ): Promise<void> {
    const file = await this.fileRepository.findById(fileId, user);
    if (!file) {
      throw new Error('File not found');
    }

    if (!fs.existsSync(file.path)) {
      throw new Error('File not found in storage');
    }

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    fs.createReadStream(file.path).pipe(res);
  }

  async downloadSharedFile(
    token: string,
    password: string | undefined,
    res: Response,
  ): Promise<void> {
    const share = await this.fileShareRepository.findByToken(token);
    if (!share) {
      throw new Error('Invalid share token');
    }

    // Check password
    if (share.password && share.password !== password) {
      throw new Error('Invalid password');
    }

    // Check expiry
    if (share.expiresAt && new Date() > share.expiresAt) {
      throw new Error('Share link has expired');
    }

    // Check download limit
    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      throw new Error('Download limit reached');
    }

    const file = share.file;
    if (!fs.existsSync(file.path)) {
      throw new Error('File not found in storage');
    }

    // Update download count
    share.downloadCount += 1;
    await this.fileShareRepository.save(share);

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    fs.createReadStream(file.path).pipe(res);
  }
}
