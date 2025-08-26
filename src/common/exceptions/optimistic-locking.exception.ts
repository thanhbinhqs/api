import { ConflictException } from '@nestjs/common';

export class OptimisticLockingException extends ConflictException {
  constructor(entityName: string, id: string) {
    super(
      `Dữ liệu ${entityName} với ID ${id} đã được cập nhật bởi người khác. Vui lòng làm mới trang và thử lại.`,
    );
  }
}
