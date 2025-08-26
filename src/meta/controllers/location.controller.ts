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
import { LocationService } from '../services/location.service';
import { CreateLocationDto } from '../dto/location/create-location.dto';
import { UpdateLocationDto } from '../dto/location/update-location.dto';
import { LocationFilterDto } from '../dto/location/location-filter.dto';
import { Location } from '../entities/location.entity';
import { PaginatedResult } from 'src/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HasPermission } from 'src/common/decorators/has-permission.decorator';
import { Permission } from 'src/common/enums/permission.enum';

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @HasPermission(Permission.LOCATION_CREATE)
  @ApiOperation({ summary: 'Tạo location mới' })
  @ApiResponse({
    status: 201,
    description: 'Location đã được tạo thành công',
    type: Location,
  })
  @ApiResponse({
    status: 409,
    description: 'Location với tên hoặc mã đã tồn tại',
  })
  async create(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    return this.locationService.createLocation(createLocationDto);
  }

  @Get()
  @HasPermission(Permission.LOCATION_READ)
  @ApiOperation({ summary: 'Lấy danh sách locations với filter và phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách locations',
    type: PaginatedResult<Location>,
  })
  async findAll(
    @Query() filterDto: LocationFilterDto,
  ): Promise<PaginatedResult<Location>> {
    return this.locationService.findAllLocations(filterDto);
  }

  @Get('simple')
  @HasPermission(Permission.LOCATION_READ)
  @ApiOperation({
    summary: 'Lấy danh sách locations đơn giản không phân trang',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách locations đơn giản',
    type: [Location],
  })
  async findAllSimple(): Promise<Location[]> {
    return this.locationService.findAllLocationsSimple();
  }

  @Get('code/:code')
  @HasPermission(Permission.LOCATION_READ)
  @ApiOperation({ summary: 'Lấy location theo code' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin location',
    type: Location,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy location',
  })
  async findByCode(@Param('code') code: string): Promise<Location> {
    const location = await this.locationService.findLocationByCode(code);
    if (!location) {
      throw new NotFoundException(`Location với mã "${code}" không tồn tại`);
    }
    return location;
  }

  @Get('name/:name')
  @HasPermission(Permission.LOCATION_READ)
  @ApiOperation({ summary: 'Lấy locations theo tên' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách locations theo tên',
    type: [Location],
  })
  async findByName(@Param('name') name: string): Promise<Location[]> {
    return this.locationService.findLocationsByName(name);
  }

  @Get(':id')
  @HasPermission(Permission.LOCATION_READ)
  @ApiOperation({ summary: 'Lấy location theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin location',
    type: Location,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy location',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Location> {
    const location = await this.locationService.findLocationById(id);
    if (!location) {
      throw new NotFoundException(`Location với ID "${id}" không tồn tại`);
    }
    return location;
  }

  @Patch(':id')
  @HasPermission(Permission.LOCATION_UPDATE)
  @ApiOperation({ summary: 'Cập nhật location' })
  @ApiResponse({
    status: 200,
    description: 'Location đã được cập nhật thành công',
    type: Location,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy location',
  })
  @ApiResponse({
    status: 409,
    description: 'Location với tên hoặc mã đã tồn tại',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    return this.locationService.updateLocation(id, updateLocationDto);
  }

  @Delete(':id')
  @HasPermission(Permission.LOCATION_DELETE)
  @ApiOperation({ summary: 'Xóa location' })
  @ApiResponse({
    status: 200,
    description: 'Location đã được xóa thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy location',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.locationService.deleteLocation(id);
    return { message: 'Location đã được xóa thành công' };
  }
}
