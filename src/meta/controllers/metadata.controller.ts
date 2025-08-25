import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ZoneService } from '../services/zone.service';
import { LineService } from '../services/line.service';
import { ProjectService } from '../services/project.service';
import { ProcessService } from '../services/process.service';
import { LocationService } from '../services/location.service';
import { VendorService } from '../services/vendor.service';
import { JigStatus } from '../../jig/entities/jig-detail.entity';
import { PartDetailStatus } from '../../part/entities/part-detail.entity';

@ApiTags('Metadata')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('metadata')
export class MetadataController {
  constructor(
    private readonly zoneService: ZoneService,
    private readonly lineService: LineService,
    private readonly projectService: ProjectService,
    private readonly processService: ProcessService,
    private readonly locationService: LocationService,
    private readonly vendorService: VendorService,
  ) {}

  @Get('enums')
  @ApiOperation({ summary: 'Lấy tất cả enum values cho UI' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả enum values',
    schema: {
      type: 'object',
      properties: {
        jigStatus: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
        partDetailStatus: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
        jigTypes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' }
            }
          }
        },
        drawingTypes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' }
            }
          }
        },
        drawingStatus: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' }
            }
          }
        },
        orderTypes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' }
            }
          }
        }
      }
    }
  })
  getEnums() {
    return {
      jigStatus: [
        { value: JigStatus.NEW, label: 'Mới', description: 'Jig detail mới được tạo' },
        { value: JigStatus.STORAGE, label: 'Kho', description: 'Đang lưu trữ trong kho' },
        { value: JigStatus.LINE, label: 'Line sản xuất', description: 'Đang sử dụng trên line sản xuất' },
        { value: JigStatus.REPAIR, label: 'Sửa chữa', description: 'Đang trong quá trình sửa chữa' },
        { value: JigStatus.SCRAP, label: 'Hủy bỏ', description: 'Đã hủy bỏ không sử dụng được' },
        { value: JigStatus.VENDOR, label: 'Nhà cung cấp', description: 'Đang ở nhà cung cấp' },
      ],
      partDetailStatus: [
        { value: PartDetailStatus.AVAILABLE, label: 'Sẵn sàng', description: 'Part detail sẵn sàng sử dụng' },
        { value: PartDetailStatus.IN_USE, label: 'Đang sử dụng', description: 'Part detail đang được sử dụng' },
        { value: PartDetailStatus.MAINTENANCE, label: 'Bảo dưỡng', description: 'Đang trong quá trình bảo dưỡng' },
        { value: PartDetailStatus.REPAIR, label: 'Sửa chữa', description: 'Đang trong quá trình sửa chữa' },
        { value: PartDetailStatus.SCRAP, label: 'Hủy bỏ', description: 'Đã hủy bỏ không sử dụng được' },
      ],
      jigTypes: [
        { value: 'mechanical', label: 'Cơ khí' },
        { value: 'hw', label: 'Phần cứng' },
        { value: 'sw', label: 'Phần mềm' },
      ],
      drawingTypes: [
        { value: 'assembly', label: 'Lắp ráp' },
        { value: 'detail', label: 'Chi tiết' },
        { value: 'schematic', label: 'Sơ đồ' },
        { value: 'layout', label: 'Bố trí' },
        { value: 'electrical', label: 'Điện' },
        { value: 'mechanical', label: 'Cơ khí' },
      ],
      drawingStatus: [
        { value: 'draft', label: 'Nháp' },
        { value: 'approved', label: 'Đã phê duyệt' },
        { value: 'rejected', label: 'Bị từ chối' },
        { value: 'obsolete', label: 'Đã lỗi thời' },
      ],
      orderTypes: [
        { value: 'material', label: 'Vật liệu' },
        { value: 'mro', label: 'MRO' },
        { value: 'self-made', label: 'Tự sản xuất' },
      ],
      currencies: [
        { value: 'VND', label: 'Việt Nam Đồng' },
        { value: 'USD', label: 'US Dollar' },
        { value: 'EUR', label: 'Euro' },
        { value: 'JPY', label: 'Japanese Yen' },
      ],
      units: [
        { value: 'pcs', label: 'Cái' },
        { value: 'kg', label: 'Kilogram' },
        { value: 'meter', label: 'Mét' },
        { value: 'liter', label: 'Lít' },
        { value: 'box', label: 'Hộp' },
        { value: 'set', label: 'Bộ' },
      ],
    };
  }

  @Get('zones')
  @ApiOperation({ summary: 'Lấy danh sách tất cả zones' })
  @ApiResponse({ status: 200, description: 'Danh sách zones' })
  async getZones() {
    const zones = await this.zoneService.findAllZonesSimple();
    return zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      code: zone.code,
      description: zone.description,
      isActive: zone.isActive,
    }));
  }

  @Get('lines')
  @ApiOperation({ summary: 'Lấy danh sách tất cả lines' })
  @ApiResponse({ status: 200, description: 'Danh sách lines' })
  async getLines() {
    const lines = await this.lineService.findAllLinesSimple();
    return lines.map(line => ({
      id: line.id,
      name: line.name,
      code: line.code,
      description: line.description,
      zoneId: line.zone?.id,
      zoneName: line.zone?.name,
      isActive: line.isActive,
    }));
  }

  @Get('projects')
  @ApiOperation({ summary: 'Lấy danh sách tất cả projects' })
  @ApiResponse({ status: 200, description: 'Danh sách projects' })
  async getProjects() {
    const projects = await this.projectService.findAllProjectsSimple();
    return projects.map(project => ({
      id: project.id,
      name: project.name,
      code: project.code,
      slug: project.slug,
      friendlyName: project.friendlyName,
      description: project.description,
      isActive: project.isActive,
    }));
  }

  @Get('processes')
  @ApiOperation({ summary: 'Lấy danh sách tất cả processes' })
  @ApiResponse({ status: 200, description: 'Danh sách processes' })
  async getProcesses() {
    const processes = await this.processService.findAllProcessesSimple();
    return processes.map(process => ({
      id: process.id,
      name: process.name,
      code: process.code,
      description: process.description,
      isActive: process.isActive,
    }));
  }

  @Get('locations')
  @ApiOperation({ summary: 'Lấy danh sách tất cả locations' })
  @ApiResponse({ status: 200, description: 'Danh sách locations' })
  async getLocations() {
    const locations = await this.locationService.findAllLocationsSimple();
    return locations.map(location => ({
      id: location.id,
      name: location.name,
      code: location.code,
      description: location.description,
      isActive: location.isActive,
    }));
  }

  @Get('vendors')
  @ApiOperation({ summary: 'Lấy danh sách tất cả vendors' })
  @ApiResponse({ status: 200, description: 'Danh sách vendors' })
  async getVendors() {
    const vendors = await this.vendorService.findAllVendorsSimple();
    return vendors.map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      code: vendor.code,
      description: vendor.description,
      isActive: vendor.isActive,
    }));
  }

  @Get('all')
  @ApiOperation({ summary: 'Lấy tất cả metadata trong một request' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tất cả metadata',
    schema: {
      type: 'object',
      properties: {
        enums: { type: 'object' },
        zones: { type: 'array' },
        lines: { type: 'array' },
        projects: { type: 'array' },
        processes: { type: 'array' },
        locations: { type: 'array' },
        vendors: { type: 'array' },
      }
    }
  })
  async getAllMetadata() {
    const [enums, zones, lines, projects, processes, locations, vendors] = await Promise.all([
      this.getEnums(),
      this.getZones(),
      this.getLines(),
      this.getProjects(),
      this.getProcesses(),
      this.getLocations(),
      this.getVendors(),
    ]);

    return {
      enums,
      zones,
      lines,
      projects,
      processes,
      locations,
      vendors,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('dropdown-options')
  @ApiOperation({ summary: 'Lấy options cho dropdown/select components' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dropdown options được format cho UI',
    schema: {
      type: 'object',
      properties: {
        zones: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              label: { type: 'string' },
              disabled: { type: 'boolean' }
            }
          }
        }
      }
    }
  })
  async getDropdownOptions() {
    const [zones, lines, projects, processes, locations, vendors] = await Promise.all([
      this.getZones(),
      this.getLines(),
      this.getProjects(),
      this.getProcesses(),
      this.getLocations(),
      this.getVendors(),
    ]);

    return {
      zones: zones.map(zone => ({
        value: zone.id,
        label: `${zone.code} - ${zone.name}`,
        disabled: !zone.isActive,
      })),
      lines: lines.map(line => ({
        value: line.id,
        label: `${line.code} - ${line.name}`,
        disabled: !line.isActive,
        zoneId: line.zoneId,
      })),
      projects: projects.map(project => ({
        value: project.id,
        label: `${project.code} - ${project.name}`,
        disabled: !project.isActive,
      })),
      processes: processes.map(process => ({
        value: process.id,
        label: `${process.code} - ${process.name}`,
        disabled: !process.isActive,
      })),
      locations: locations.map(location => ({
        value: location.id,
        label: `${location.code} - ${location.name}`,
        disabled: !location.isActive,
      })),
      vendors: vendors.map(vendor => ({
        value: vendor.id,
        label: `${vendor.code} - ${vendor.name}`,
        disabled: !vendor.isActive,
      })),
      jigStatus: this.getEnums().jigStatus.map(status => ({
        value: status.value,
        label: status.label,
        description: status.description,
      })),
      partDetailStatus: this.getEnums().partDetailStatus.map(status => ({
        value: status.value,
        label: status.label,
        description: status.description,
      })),
      jigTypes: this.getEnums().jigTypes.map(type => ({
        value: type.value,
        label: type.label,
      })),
      drawingTypes: this.getEnums().drawingTypes.map(type => ({
        value: type.value,
        label: type.label,
      })),
      drawingStatus: this.getEnums().drawingStatus.map(status => ({
        value: status.value,
        label: status.label,
      })),
    };
  }
}
