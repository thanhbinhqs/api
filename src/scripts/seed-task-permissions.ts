import { DataSource } from 'typeorm';
import { Role } from '../user/entities/role.entity';
import { Permission } from '../common/enums/permission.enum';

export async function seedTaskPermissions(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);

  // Lấy admin role
  const adminRole = await roleRepository.findOne({
    where: { name: 'admin' }
  });

  if (adminRole) {
    // Thêm task permissions cho admin
    const taskPermissions = [
      Permission.TASK_CREATE,
      Permission.TASK_READ,
      Permission.TASK_UPDATE,
      Permission.TASK_DELETE,
      Permission.TASK_ASSIGN,
      Permission.TASK_MANAGE_ALL
    ];

    const updatedPermissions = [...adminRole.permissions, ...taskPermissions];
    // Remove duplicates
    adminRole.permissions = [...new Set(updatedPermissions)];
    
    await roleRepository.save(adminRole);
    console.log('✅ Đã thêm task permissions cho admin role');
  }

  // Lấy hoặc tạo technician role
  let technicianRole = await roleRepository.findOne({
    where: { name: 'technician' }
  });

  if (!technicianRole) {
    technicianRole = roleRepository.create({
      name: 'technician',
      description: 'Kỹ thuật viên - Có thể thực hiện tasks được giao',
      permissions: []
    });
  }

  // Thêm task permissions cho technician
  const techPermissions = [
    Permission.TASK_READ,
    Permission.TASK_UPDATE, // Để có thể cập nhật progress và complete task
  ];

  const updatedTechPermissions = [...technicianRole.permissions, ...techPermissions];
  technicianRole.permissions = [...new Set(updatedTechPermissions)];
  
  await roleRepository.save(technicianRole);
  console.log('✅ Đã thêm task permissions cho technician role');

  // Lấy hoặc tạo supervisor role
  let supervisorRole = await roleRepository.findOne({
    where: { name: 'supervisor' }
  });

  if (!supervisorRole) {
    supervisorRole = roleRepository.create({
      name: 'supervisor',
      description: 'Giám sát viên - Có thể tạo và giao tasks',
      permissions: []
    });
  }

  // Thêm task permissions cho supervisor
  const supervisorPermissions = [
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_ASSIGN,
  ];

  const updatedSupervisorPermissions = [...supervisorRole.permissions, ...supervisorPermissions];
  supervisorRole.permissions = [...new Set(updatedSupervisorPermissions)];
  
  await roleRepository.save(supervisorRole);
  console.log('✅ Đã thêm task permissions cho supervisor role');
}
