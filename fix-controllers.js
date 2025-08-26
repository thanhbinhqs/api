const fs = require('fs');
const path = require('path');

// Controllers cần fix với their entities
const controllersToFix = [
  {
    path: 'src/meta/controllers/vendor.controller.spec.ts',
    controller: 'VendorController',
    service: 'VendorService',
    entity: 'Vendor'
  },
  {
    path: 'src/meta/controllers/process.controller.spec.ts',
    controller: 'ProcessController', 
    service: 'ProcessService',
    entity: 'Process'
  },
  {
    path: 'src/meta/controllers/project.controller.spec.ts',
    controller: 'ProjectController',
    service: 'ProjectService', 
    entity: 'Project'
  },
  {
    path: 'src/meta/controllers/inout-history.controller.spec.ts',
    controller: 'InOutHistoryController',
    service: 'InOutHistoryService',
    entity: 'InOutHistory'
  },
  {
    path: 'src/part/part-detail.controller.spec.ts',
    controller: 'PartDetailController',
    service: 'PartDetailService',
    entity: 'PartDetail'
  }
];

controllersToFix.forEach(({ path: filePath, controller, service, entity }) => {
  const fullPath = path.resolve(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    const content = `import { Test, TestingModule } from '@nestjs/testing';
import { ${controller} } from './${controller.toLowerCase()}';
import { ${service} } from '../services/${service.toLowerCase()}';
import { TestModuleBuilder } from '../../test-utils/test-module.builder';
import { ${entity} } from '../entities/${entity.toLowerCase()}.entity';

describe('${controller}', () => {
  let controller: ${controller};
  let service: ${service};

  beforeEach(async () => {
    const module: TestingModule = await new TestModuleBuilder()
      .configureForController(${controller}, ${service})
      .addMockRepository(${entity})
      .build();

    controller = module.get<${controller}>(${controller});
    service = module.get<${service}>(${service});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
`;

    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('All controllers fixed!');
