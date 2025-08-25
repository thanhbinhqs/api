import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZoneController } from './controllers/zone.controller';
import { LineController } from './controllers/line.controller';
import { ProjectController } from './controllers/project.controller';
import { ProcessController } from './controllers/process.controller';
import { InOutHistoryController } from './controllers/inout-history.controller';
import { LocationController } from './controllers/location.controller';
import { VendorController } from './controllers/vendor.controller';
import { MetadataController } from './controllers/metadata.controller';
import { ZoneService } from './services/zone.service';
import { LineService } from './services/line.service';
import { ProjectService } from './services/project.service';
import { ProcessService } from './services/process.service';
import { InOutHistoryService } from './services/inout-history.service';
import { LocationService } from './services/location.service';
import { VendorService } from './services/vendor.service';
import { Zone } from './entities/zone.entity';
import { Line } from './entities/line.entity';
import { Project } from './entities/project.entity';
import { Process } from './entities/process.entity';
import { InOutHistory } from './entities/inout-history.entity';
import { Location } from './entities/location.entity';
import { Vendor } from './entities/vendor.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Zone, 
      Line, 
      Project, 
      Process, 
      InOutHistory, 
      Location, 
      Vendor
    ]),
    UserModule
  ],
  controllers: [
    ZoneController, 
    LineController, 
    ProjectController, 
    ProcessController, 
    InOutHistoryController,
    LocationController,
    VendorController,
    MetadataController
  ],
  providers: [
    ZoneService, 
    LineService, 
    ProjectService, 
    ProcessService, 
    InOutHistoryService,
    LocationService,
    VendorService
  ],
  exports: [
    ZoneService, 
    LineService, 
    ProjectService, 
    ProcessService, 
    InOutHistoryService,
    LocationService,
    VendorService
  ],
})
export class MetaModule {}
