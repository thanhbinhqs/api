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
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VendorService } from '../services/vendor.service';
import { CreateVendorDto } from '../dto/vendor/create-vendor.dto';
import { UpdateVendorDto } from '../dto/vendor/update-vendor.dto';
import { VendorFilterDto } from '../dto/vendor/vendor-filter.dto';
import { Vendor } from '../entities/vendor.entity';
import { PaginatedResult } from 'src/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';

@ApiTags('Vendors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @HasPermission(Permission.VENDOR_CREATE)
  @ApiOperation({ summary: 'Tạo vendor mới' })
  @ApiResponse({
    status: 201,
    description: 'Vendor đã được tạo thành công',
    type: Vendor,
  })
  @ApiResponse({
    status: 409,
    description: 'Vendor với tên hoặc mã đã tồn tại',
  })
  async create(@Body() createVendorDto: CreateVendorDto): Promise<Vendor> {
    return this.vendorService.createVendor(createVendorDto);
  }

  @Get()
  @HasPermission(Permission.VENDOR_READ)
  @ApiOperation({ summary: 'Lấy danh sách vendors với filter và phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách vendors',
    type: PaginatedResult<Vendor>,
  })
  async findAll(@Query() filterDto: VendorFilterDto): Promise<PaginatedResult<Vendor>> {
    return this.vendorService.findAllVendors(filterDto);
  }

  @Get('simple')
  @HasPermission(Permission.VENDOR_READ)
  @ApiOperation({ summary: 'Lấy danh sách vendors đơn giản không phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách vendors đơn giản',
    type: [Vendor],
  })
  async findAllSimple(): Promise<Vendor[]> {
    return this.vendorService.findAllVendorsSimple();
  }

  @Get('code/:code')
  @HasPermission(Permission.VENDOR_READ)
  @ApiOperation({ summary: 'Lấy vendor theo code' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin vendor',
    type: Vendor,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy vendor',
  })
  async findByCode(@Param('code') code: string): Promise<Vendor> {
    const vendor = await this.vendorService.findVendorByCode(code);
    if (!vendor) {
      throw new NotFoundException(`Vendor với mã "${code}" không tồn tại`);
    }
    return vendor;
  }

  @Get('name/:name')
  @HasPermission(Permission.VENDOR_READ)
  @ApiOperation({ summary: 'Lấy vendors theo tên' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách vendors theo tên',
    type: [Vendor],
  })
  async findByName(@Param('name') name: string): Promise<Vendor[]> {
    return this.vendorService.findVendorsByName(name);
  }

  @Get(':id')
  @HasPermission(Permission.VENDOR_READ)
  @ApiOperation({ summary: 'Lấy vendor theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin vendor',
    type: Vendor,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy vendor',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Vendor> {
    const vendor = await this.vendorService.findVendorById(id);
    if (!vendor) {
      throw new NotFoundException(`Vendor với ID "${id}" không tồn tại`);
    }
    return vendor;
  }

  @Patch(':id')
  @HasPermission(Permission.VENDOR_UPDATE)
  @ApiOperation({ summary: 'Cập nhật vendor' })
  @ApiResponse({
    status: 200,
    description: 'Vendor đã được cập nhật thành công',
    type: Vendor,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy vendor',
  })
  @ApiResponse({
    status: 409,
    description: 'Vendor với tên hoặc mã đã tồn tại',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    return this.vendorService.updateVendor(id, updateVendorDto);
  }

  @Delete(':id')
  @HasPermission(Permission.VENDOR_DELETE)
  @ApiOperation({ summary: 'Xóa vendor' })
  @ApiResponse({
    status: 200,
    description: 'Vendor đã được xóa thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy vendor',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.vendorService.deleteVendor(id);
    return { message: 'Vendor đã được xóa thành công' };
  }
}
