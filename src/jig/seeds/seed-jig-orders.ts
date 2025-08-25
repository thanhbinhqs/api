import { DataSource } from 'typeorm';
import { JigOrder, JigOrderDetail, JigOrderStatus, JigOrderPriority } from '../entities/jig-order.entity';
import { User } from 'src/user/entities/user.entity';
import { JigDetail } from '../entities/jig-detail.entity';
import { Location } from 'src/meta/entities/location.entity';
import { Line } from 'src/meta/entities/line.entity';

export async function seedJigOrders(dataSource: DataSource) {
  const jigOrderRepository = dataSource.getRepository(JigOrder);
  const jigOrderDetailRepository = dataSource.getRepository(JigOrderDetail);
  const userRepository = dataSource.getRepository(User);
  const jigDetailRepository = dataSource.getRepository(JigDetail);
  const locationRepository = dataSource.getRepository(Location);
  const lineRepository = dataSource.getRepository(Line);

  console.log('🌱 Seeding sample jig orders...');

  // Lấy users và jig details mẫu
  const users = await userRepository.find({ take: 5 });
  const jigDetails = await jigDetailRepository.find({ take: 10 });
  const locations = await locationRepository.find({ take: 3 });
  const lines = await lineRepository.find({ take: 3 });

  if (users.length === 0 || jigDetails.length === 0) {
    console.log('⚠️ Không có user hoặc jig detail để tạo sample orders');
    return;
  }

  const sampleOrders = [
    {
      orderCode: 'JO202412260001',
      title: 'Order jig cho Line Production A',
      description: 'Cần jig để sản xuất batch ABC123',
      status: JigOrderStatus.SUBMITTED,
      priority: JigOrderPriority.HIGH,
      requiredDate: new Date('2024-12-30'),
      requester: users[0],
      deliveryLine: lines[0] || null,
      orderDetails: [
        {
          jigDetail: jigDetails[0],
          quantity: 2,
          notes: 'Cần kiểm tra trước khi giao'
        },
        {
          jigDetail: jigDetails[1],
          quantity: 1,
          notes: 'Urgent - cần gấp'
        }
      ]
    },
    {
      orderCode: 'JO202412260002',
      title: 'Order jig cho kho Storage B',
      description: 'Bổ sung jig cho kho dự phòng',
      status: JigOrderStatus.APPROVED,
      priority: JigOrderPriority.NORMAL,
      requiredDate: new Date('2024-12-28'),
      requester: users[1],
      approver: users[2],
      approvedDate: new Date(),
      deliveryLocation: locations[0] || null,
      orderDetails: [
        {
          jigDetail: jigDetails[2],
          quantity: 3,
          notes: 'Để dự phòng'
        }
      ]
    },
    {
      orderCode: 'JO202412260003',
      title: 'Order jig cho bảo trì',
      description: 'Jig thay thế cho máy đang bảo trì',
      status: JigOrderStatus.READY,
      priority: JigOrderPriority.URGENT,
      requiredDate: new Date('2024-12-27'),
      requester: users[3],
      approver: users[2],
      preparer: users[4],
      approvedDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      preparedDate: new Date(),
      deliveryLocation: locations[1] || null,
      orderDetails: [
        {
          jigDetail: jigDetails[3],
          quantity: 1,
          notes: 'Thay thế khẩn cấp',
          isPrepared: true,
          preparedDate: new Date(),
          actualQuantity: 1
        }
      ]
    },
    {
      orderCode: 'JO202412260004',
      title: 'Order jig cho dự án mới',
      description: 'Jig cho sản phẩm mới triển khai',
      status: JigOrderStatus.PICKED_UP,
      priority: JigOrderPriority.NORMAL,
      requiredDate: new Date('2024-12-25'),
      requester: users[0],
      approver: users[2],
      preparer: users[4],
      receiver: users[1],
      approvedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      preparedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      notifiedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      pickedUpDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      completedDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
      deliveryLine: lines[1] || null,
      orderDetails: [
        {
          jigDetail: jigDetails[4],
          quantity: 2,
          notes: 'Hoàn thành',
          isPrepared: true,
          preparedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          actualQuantity: 2
        },
        {
          jigDetail: jigDetails[5],
          quantity: 1,
          notes: 'Hoàn thành',
          isPrepared: true,
          preparedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          actualQuantity: 1
        }
      ]
    }
  ];

  for (const orderData of sampleOrders) {
    try {
      // Tạo order
      const { orderDetails, ...orderInfo } = orderData;
      const order = jigOrderRepository.create(orderInfo);
      const savedOrder = await jigOrderRepository.save(order);

      // Tạo order details
      for (const detailData of orderDetails) {
        const orderDetail = jigOrderDetailRepository.create({
          ...detailData,
          order: savedOrder
        });
        await jigOrderDetailRepository.save(orderDetail);
      }

      console.log(`✅ Created sample order: ${orderData.orderCode}`);

    } catch (error) {
      console.error(`❌ Error creating order ${orderData.orderCode}:`, error.message);
    }
  }

  console.log('✅ Seeded sample jig orders successfully');
}

export async function seedJigOrderData(dataSource: DataSource) {
  try {
    await seedJigOrders(dataSource);
  } catch (error) {
    console.error('❌ Error seeding jig order data:', error);
    throw error;
  }
}
