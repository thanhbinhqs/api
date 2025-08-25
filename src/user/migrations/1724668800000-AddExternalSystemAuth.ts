import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddExternalSystemAuth1724668800000 implements MigrationInterface {
  name = 'AddExternalSystemAuth1724668800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cột external_system_auth_info
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'external_system_auth_info',
        type: 'text',
        isNullable: true,
        default: null,
        comment: 'Encrypted external system authentication information',
      }),
    );

    // Thêm cột external_system_auth_notifications
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'external_system_auth_notifications',
        type: 'jsonb',
        isNullable: true,
        default: "'[]'",
        comment: 'Notifications for external system authentication status',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa các cột đã thêm
    await queryRunner.dropColumn('users', 'external_system_auth_notifications');
    await queryRunner.dropColumn('users', 'external_system_auth_info');
  }
}
