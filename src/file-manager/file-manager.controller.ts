import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Res,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileManagerService } from './file-manager.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AllowAnonymous } from '../common/decorators/allow-anonymous.decorator';
import { User } from '../user/entities/user.entity';
import type { Response } from 'express';
import { CreateShareDto } from './dto/create-share.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('File Manager')
@Controller('files')
@AllowAnonymous()
@UseGuards(JwtAuthGuard)
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload file (supports chunk upload)',
    description:
      'Upload a file with optional chunking. Files from anonymous users will be stored in public folder',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload with chunk information',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload',
        },
        chunkIndex: {
          type: 'number',
          description: 'Current chunk index (0-based)',
          example: 0,
          required: [],
        },
        totalChunks: {
          type: 'number',
          description: 'Total number of chunks',
          example: 1,
          required: [],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @CurrentUser() user: User | null,
  ) {
    return this.fileManagerService.uploadFile(
      file,
      user,
      uploadFileDto.chunkIndex || 0,
      uploadFileDto.totalChunks || 1,
      uploadFileDto.fileId,
      uploadFileDto.resumeCheck,
      uploadFileDto.fileName,
      uploadFileDto.fileSize,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get list of files (public files when not logged in)',
  })
  @ApiResponse({ status: 200, description: 'List of files' })
  async getFiles(@CurrentUser() user: User | null) {
    return this.fileManagerService.getFiles(user);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Create share link for a file' })
  @ApiResponse({ status: 201, description: 'Share link created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async createShare(
    @Param('id') fileId: string,
    @CurrentUser() user: User,
    @Body() createShareDto: CreateShareDto,
  ) {
    return this.fileManagerService.createShare(fileId, user, {
      password: createShareDto.password,
      expiresAt: createShareDto.expiresAt,
      maxDownloads: createShareDto.maxDownloads,
    });
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a file' })
  @ApiResponse({ status: 200, description: 'File download' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadFile(
    @Param('id') fileId: string,
    @Res() res: Response,
    @CurrentUser() user: User | null,
  ) {
    return this.fileManagerService.downloadFile(fileId, user, res);
  }

  @Get('shared/:token')
  @ApiOperation({ summary: 'Download file via share token' })
  @ApiResponse({ status: 200, description: 'File download' })
  @ApiResponse({ status: 400, description: 'Invalid share token or password' })
  @ApiResponse({
    status: 403,
    description: 'Share link expired or download limit reached',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadSharedFile(
    @Param('token') token: string,
    @Query('password') password: string | undefined,
    @Res() res: Response,
  ) {
    return this.fileManagerService.downloadSharedFile(token, password, res);
  }
}
