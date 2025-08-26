import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from '../services/location.service';
import { TestModuleBuilder } from '../../test-utils/test-module.builder';
import { Location } from '../entities/location.entity';

describe('LocationController', () => {
  let controller: LocationController;
  let service: LocationService;

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .configureForController(LocationController, LocationService)
      .addMockRepository(Location)
      .build();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
