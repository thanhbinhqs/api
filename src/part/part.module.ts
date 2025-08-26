import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartService } from './part.service';
import { PartController } from './part.controller';
import { PartDetailService } from './part-detail.service';
import { PartDetailController } from './part-detail.controller';
import { Part } from './entities/part.entity';
import { PartDetail } from './entities/part-detail.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Part, PartDetail]), UserModule],
  controllers: [PartController, PartDetailController],
  providers: [PartService, PartDetailService],
  exports: [PartService, PartDetailService],
})
export class PartModule {}
