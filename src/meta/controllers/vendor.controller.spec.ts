import { Test, TestingModule } from '@nestjs/testing';
import { VendorController } from './vendor.controller';
import { VendorService } from '../services/vendor.service';
import { TestModuleBuilder } from '../../test-utils/test-module.builder';
import { Vendor } from '../entities/vendor.entity';

describe('VendorController', () => {
  let controller: VendorController;
  let service: VendorService;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .configureForController(VendorController, VendorService)
      .addMockRepository(Vendor)
      .build();

    controller = module.get<VendorController>(VendorController);
    service = module.get<VendorService>(VendorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
