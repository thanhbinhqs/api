import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseUUIDPipe,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import { JigDrawingService } from './jig-drawing.service';
import { CreateJigDrawingDto } from './dto/create-jig-drawing.dto';
import { UpdateJigDrawingDto } from './dto/update-jig-drawing.dto';
import { JigDrawingFilterDto } from './dto/jig-drawing-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@ApiTags('Jig Drawings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jig-drawings')
export class JigDrawingController {
    constructor(private readonly jigDrawingService: JigDrawingService) {}

    @Post()
    @ApiOperation({ summary: 'Tạo bản vẽ Jig mới' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Bản vẽ Jig đã được tạo thành công',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Dữ liệu đầu vào không hợp lệ',
    })
    create(@Body() createJigDrawingDto: CreateJigDrawingDto) {
        return this.jigDrawingService.create(createJigDrawingDto);
    }

    @Post('upload')
    @ApiOperation({ summary: 'Upload bản vẽ Jig' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                jigId: {
                    type: 'string',
                    format: 'uuid',
                },
                name: {
                    type: 'string',
                },
                description: {
                    type: 'string',
                },
                drawingType: {
                    type: 'string',
                },
                drawingNumber: {
                    type: 'string',
                },
                revision: {
                    type: 'string',
                },
            },
            required: ['file', 'jigId', 'name'],
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './storage/jig-drawings',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                const allowedTypes = [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'application/dwg',
                    'application/step',
                    'application/iges',
                    'application/x-dwg',
                ];
                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('Loại file không được hỗ trợ'), false);
                }
            },
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB
            },
        }),
    )
    async uploadDrawing(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
    ) {
        if (!file) {
            throw new BadRequestException('Vui lòng chọn file để upload');
        }

        // Tạo thư mục nếu chưa tồn tại
        const uploadDir = './storage/jig-drawings';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const createDto: CreateJigDrawingDto = {
            name: body.name,
            description: body.description,
            fileName: file.originalname,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype,
            fileFormat: extname(file.originalname).substring(1),
            jigId: body.jigId,
            drawingType: body.drawingType || 'assembly',
            drawingNumber: body.drawingNumber,
            revision: body.revision || 'A',
        };

        return this.jigDrawingService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách bản vẽ Jig' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Danh sách bản vẽ Jig',
    })
    findAll(@Query() filterDto: JigDrawingFilterDto) {
        return this.jigDrawingService.findAll(filterDto);
    }

    @Get('jig/:jigId')
    @ApiOperation({ summary: 'Lấy danh sách bản vẽ theo Jig ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Danh sách bản vẽ của Jig',
    })
    findByJigId(@Param('jigId', ParseUUIDPipe) jigId: string) {
        return this.jigDrawingService.findByJigId(jigId);
    }

    @Get('jig/:jigId/latest')
    @ApiOperation({ summary: 'Lấy phiên bản mới nhất của bản vẽ' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Phiên bản mới nhất của bản vẽ',
    })
    getLatestVersion(
        @Param('jigId', ParseUUIDPipe) jigId: string,
        @Query('drawingNumber') drawingNumber?: string,
    ) {
        return this.jigDrawingService.getLatestVersion(jigId, drawingNumber);
    }

    @Get('jig/:jigId/history')
    @ApiOperation({ summary: 'Lấy lịch sử phiên bản bản vẽ' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Lịch sử phiên bản bản vẽ',
    })
    getVersionHistory(
        @Param('jigId', ParseUUIDPipe) jigId: string,
        @Query('drawingNumber') drawingNumber?: string,
    ) {
        return this.jigDrawingService.getVersionHistory(jigId, drawingNumber);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy thông tin bản vẽ Jig theo ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Thông tin bản vẽ Jig',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Không tìm thấy bản vẽ Jig',
    })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.jigDrawingService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin bản vẽ Jig' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Bản vẽ Jig đã được cập nhật thành công',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Không tìm thấy bản vẽ Jig',
    })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateJigDrawingDto: UpdateJigDrawingDto,
    ) {
        return this.jigDrawingService.update(id, updateJigDrawingDto);
    }

    @Patch(':id/approve')
    @ApiOperation({ summary: 'Phê duyệt bản vẽ Jig' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Bản vẽ Jig đã được phê duyệt',
    })
    approve(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ) {
        return this.jigDrawingService.approve(id, user.username);
    }

    @Patch(':id/reject')
    @ApiOperation({ summary: 'Từ chối bản vẽ Jig' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Bản vẽ Jig đã bị từ chối',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                notes: {
                    type: 'string',
                    description: 'Lý do từ chối',
                },
            },
        },
    })
    reject(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: { notes?: string },
    ) {
        return this.jigDrawingService.reject(id, body.notes);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa bản vẽ Jig' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Bản vẽ Jig đã được xóa thành công',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Không tìm thấy bản vẽ Jig',
    })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.jigDrawingService.remove(id);
    }
}
