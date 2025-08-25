import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateJigOrderTables1703611200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng jig-orders
        await queryRunner.createTable(
            new Table({
                name: 'jig-orders',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'orderCode',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['draft', 'submitted', 'approved', 'rejected', 'preparing', 'ready', 'notified', 'picked_up', 'cancelled'],
                        default: "'draft'",
                    },
                    {
                        name: 'priority',
                        type: 'enum',
                        enum: ['low', 'normal', 'high', 'urgent'],
                        default: "'normal'",
                    },
                    {
                        name: 'requestedDate',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'requiredDate',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'approvedDate',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'preparedDate',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'notifiedDate',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'pickedUpDate',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'completedDate',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'requester_id',
                        type: 'uuid',
                    },
                    {
                        name: 'approver_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'preparer_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'receiver_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'delivery_location_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'delivery_line_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'approvalRequestId',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'rejectionReason',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'preparationNotes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'deliveryNotes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deletedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'isDeleted',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true,
                    },
                ],
            }),
            true,
        );

        // Tạo bảng jig-order-details
        await queryRunner.createTable(
            new Table({
                name: 'jig-order-details',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'order_id',
                        type: 'uuid',
                    },
                    {
                        name: 'jig_detail_id',
                        type: 'uuid',
                    },
                    {
                        name: 'quantity',
                        type: 'int',
                    },
                    {
                        name: 'notes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'isPrepared',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'preparedDate',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'actualQuantity',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deletedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'isDeleted',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true,
                    },
                ],
            }),
            true,
        );

        // Tạo foreign keys cho jig-orders
        await queryRunner.createForeignKey(
            'jig-orders',
            new TableForeignKey({
                columnNames: ['requester_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
            }),
        );

        await queryRunner.createForeignKey(
            'jig-orders',
            new TableForeignKey({
                columnNames: ['approver_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        );

        await queryRunner.createForeignKey(
            'jig-orders',
            new TableForeignKey({
                columnNames: ['preparer_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        );

        await queryRunner.createForeignKey(
            'jig-orders',
            new TableForeignKey({
                columnNames: ['receiver_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        );

        await queryRunner.createForeignKey(
            'jig-orders',
            new TableForeignKey({
                columnNames: ['delivery_location_id'],
                referencedTableName: 'locations',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        );

        await queryRunner.createForeignKey(
            'jig-orders',
            new TableForeignKey({
                columnNames: ['delivery_line_id'],
                referencedTableName: 'lines',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        );

        // Tạo foreign keys cho jig-order-details
        await queryRunner.createForeignKey(
            'jig-order-details',
            new TableForeignKey({
                columnNames: ['order_id'],
                referencedTableName: 'jig-orders',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'jig-order-details',
            new TableForeignKey({
                columnNames: ['jig_detail_id'],
                referencedTableName: 'jig-details',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
            }),
        );

        // Tạo indexes
        await queryRunner.createIndex(
            'jig-orders',
            new TableIndex({
                name: 'IDX_jig_orders_status',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createIndex(
            'jig-orders',
            new TableIndex({
                name: 'IDX_jig_orders_priority',
                columnNames: ['priority'],
            }),
        );

        await queryRunner.createIndex(
            'jig-orders',
            new TableIndex({
                name: 'IDX_jig_orders_requester',
                columnNames: ['requester_id'],
            }),
        );

        await queryRunner.createIndex(
            'jig-orders',
            new TableIndex({
                name: 'IDX_jig_orders_required_date',
                columnNames: ['requiredDate'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('jig-order-details');
        await queryRunner.dropTable('jig-orders');
    }
}
