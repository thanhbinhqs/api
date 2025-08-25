# BPlus API - Hệ thống quản lý sản xuất thông minh

![NestJS](https://img.shields.io/badge/NestJS-11.0.0-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791.svg)
![Redis](https://img.shields.io/badge/Redis-Cache-red.svg)
![License](https://img.shields.io/badge/License-Private-yellow.svg)
## 📋 Tổng quan

BPlus API là hệ thống backend quản lý sản xuất thông minh được xây dựng bằng NestJS và TypeScript. Hệ thống cung cấp các tính năng quản lý toàn diện cho môi trường sản xuất, bao gồm quản lý jig, phê duyệt quy trình, thông báo real-time và audit trail.

## 🏗️ Kiến trúc hệ thống

### 📁 Cấu trúc dự án

```
src/
├── approval/          # Hệ thống phê duyệt workflow
├── audit-log/         # Audit trail và logging
├── auth/              # Authentication & Authorization
├── common/            # Shared utilities và services
├── file-manager/      # Quản lý files và upload
├── jig/               # Quản lý jig và order system
├── meta/              # Master data (zones, lines, projects...)
├── notification/      # Real-time notifications
├── part/              # Quản lý parts và chi tiết
├── schedule/          # Task scheduling
├── system-settings/   # Cấu hình hệ thống
├── task/              # Task management
├── user/              # User management
└── migrations/        # Database migrations
```

### 🚀 Tính năng chính

#### 🔧 **Jig Order Management System**
- **Quy trình đầy đủ**: DRAFT → SUBMITTED → APPROVED → PREPARING → READY → NOTIFIED → PICKED_UP
- **Tích hợp approval workflow**: Phê duyệt tự động và thủ công
- **Tracking real-time**: Theo dõi trạng thái và vị trí jig
- **Audit trail**: Lịch sử xuất nhập đầy đủ

#### 🔐 **Authentication & Authorization**
- JWT-based authentication với refresh tokens
- Role-based access control (RBAC)
- Permission-based authorization
- External system authentication
- Multi-device login control

#### 📊 **Real-time Notifications**
- WebSocket notifications
- Multi-channel delivery (user/role/permission)
- Event-driven architecture
- Notification history tracking

#### 📁 **File Management**
- Secure file upload/download
- Multiple file type support
- Storage optimization
- Access control

#### 🔄 **Approval Workflow**
- Configurable multi-step approvals
- Auto and manual approval modes
- Delegation và escalation
- Workflow templates

#### 📈 **Meta Data Management**
- Zones, Lines, Projects quản lý
- Location tracking
- Vendor management
- Process definitions

## 🛠️ Công nghệ sử dụng

### Backend Framework
- **NestJS 11.0** - Progressive Node.js framework
- **TypeScript 5.7** - Strongly typed JavaScript
- **TypeORM 0.3** - Database ORM

### Database & Cache
- **PostgreSQL** - Primary database
- **Redis** - Caching và session storage

### Authentication & Security
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Real-time & Background Processing
- **Socket.IO** - WebSocket cho real-time notifications
- **Bull Queue** - Background job processing
- **Node Cron** - Task scheduling

### Documentation & Testing
- **Swagger/OpenAPI** - API documentation
- **Jest** - Unit và integration testing
- **Supertest** - API testing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Winston** - Logging

## ⚙️ Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- npm >= 8.0.0
- PostgreSQL >= 13.0
- Redis >= 6.0

### 1. Clone repository
```bash
git clone <repository-url>
cd api
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình environment variables

Tạo file `.env` từ `.env.test`:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=bplus_db
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# App Configuration
APP_PORT=3000
APP_ENV=production

# Encryption Configuration
ENCRYPTION_KEY=your-32-character-encryption-key
ENCRYPTION_IV=your-32-character-encryption-iv
```

### 4. Setup database
```bash
# Chạy migrations
npm run typeorm migration:run

# Seed data (optional)
npm run seed
```

### 5. Chạy ứng dụng

#### Development mode
```bash
npm run start:dev
```

#### Production mode
```bash
npm run build
npm run start:prod
```

## 📚 API Documentation

### Swagger Documentation
Sau khi khởi động server, truy cập:
```
http://localhost:3000/api/docs
```

### API Endpoints chính

#### Authentication
```http
POST /api/v1/auth/login          # Đăng nhập
POST /api/v1/auth/refresh        # Refresh token
POST /api/v1/auth/logout         # Đăng xuất
```

#### Jig Order Management
```http
GET    /api/v1/jig-orders        # Danh sách orders
POST   /api/v1/jig-orders        # Tạo order mới
GET    /api/v1/jig-orders/{id}   # Chi tiết order
PUT    /api/v1/jig-orders/{id}   # Cập nhật order
DELETE /api/v1/jig-orders/{id}   # Xóa order

# Workflow endpoints
POST /api/v1/jig-orders/{id}/submit   # Submit để phê duyệt
POST /api/v1/jig-orders/{id}/approve  # Phê duyệt order
POST /api/v1/jig-orders/{id}/reject   # Từ chối order
POST /api/v1/jig-orders/{id}/prepare  # Chuẩn bị jig
POST /api/v1/jig-orders/{id}/notify   # Thông báo sẵn sàng
POST /api/v1/jig-orders/{id}/pickup   # Nhận jig

# Query endpoints
GET /api/v1/jig-orders/my-orders           # Orders của user
GET /api/v1/jig-orders/pending-approvals  # Chờ phê duyệt
GET /api/v1/jig-orders/pending-preparations # Chờ chuẩn bị
GET /api/v1/jig-orders/statistics          # Thống kê
```

#### User Management
```http
GET    /api/v1/user              # Danh sách users
POST   /api/v1/user              # Tạo user mới
GET    /api/v1/user/{id}         # Chi tiết user
PUT    /api/v1/user/{id}         # Cập nhật user
DELETE /api/v1/user/{id}         # Xóa user
```

#### Notifications
```http
GET /api/v1/notifications        # Danh sách notifications
PUT /api/v1/notifications/{id}/read # Đánh dấu đã đọc
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 🔧 Scripts hữu ích

```bash
# Development
npm run start:dev              # Khởi động development server
npm run start:debug            # Debug mode

# Build
npm run build                  # Build production
npm run start:prod             # Khởi động production server

# Database
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
npm run typeorm migration:revert

# Code Quality
npm run lint                   # Lint code
npm run format                 # Format code
```

## 🔒 Security Features

### Authentication & Authorization
- JWT với short-lived access tokens và long-lived refresh tokens
- Role-based access control với permission granular
- Rate limiting cho API endpoints
- Password hashing với bcrypt

### Data Protection
- Encryption cho sensitive data
- Input validation với class-validator
- SQL injection protection với TypeORM
- XSS protection với helmet

### Audit & Monitoring
- Comprehensive audit logging
- Request/response tracking
- Error monitoring và reporting
- Performance metrics

## 📊 Monitoring & Logging

### Logging
- Winston logger với multiple transports
- Structured logging với JSON format
- Log levels: error, warn, info, debug
- Audit trail cho tất cả operations

### Performance Monitoring
- Request/response time tracking
- Database query monitoring
- Redis cache hit/miss rates
- WebSocket connection metrics

## 🚀 Deployment

### Production Checklist
- [ ] Cấu hình environment variables
- [ ] Setup PostgreSQL database
- [ ] Setup Redis cache
- [ ] Chạy database migrations
- [ ] Configure reverse proxy (nginx)
- [ ] Setup SSL certificates
- [ ] Configure monitoring

### Docker Support
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Tạo feature branch
3. Implement changes
4. Viết tests
5. Run linting và testing
6. Submit pull request

### Code Standards
- Follow TypeScript best practices
- Use ESLint configuration
- Maintain test coverage > 80%
- Document API changes
- Follow conventional commits

## 📞 Support

### Documentation
- API Documentation: `/api/docs`
- Implementation guides trong các module
- README files cho từng feature

### Issues
- Bug reports
- Feature requests
- Technical questions

## 📄 License

This project is private and proprietary.

---

## 🔄 Changelog

### Version 1.0.0 (Current)
- ✅ Jig Order Management System hoàn chỉnh
- ✅ Approval Workflow integration
- ✅ Real-time Notifications
- ✅ File Management system
- ✅ Comprehensive Authentication
- ✅ Audit logging
- ✅ API documentation với Swagger

### Upcoming Features
- [ ] Advanced reporting dashboard
- [ ] Mobile app support
- [ ] Integration với external systems
- [ ] Advanced analytics
- [ ] Performance optimizations

---

**Developed with ❤️ by BPlus Team**
