import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { RequestContextService } from '../request-context';
import { AuditLog } from '../entities/audit-log.entity';

@EventSubscriber()
export class AuditLogSubscriber implements EntitySubscriberInterface {
  constructor(private dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  afterInsert(event: InsertEvent<any>) {
    this.logChange(event.entity, null, 'INSERT', event.metadata.tableName);
  }

  afterUpdate(event: UpdateEvent<any>) {
    this.logChange(
      event.entity,
      event.databaseEntity,
      'UPDATE',
      event.metadata.tableName,
    );
  }

  afterRemove(event: RemoveEvent<any>) {
    this.logChange(
      event.databaseEntity,
      null,
      'DELETE',
      event.metadata.tableName,
    );
  }

  private async logChange(
    newValue: any,
    oldValue: any,
    action: 'INSERT' | 'UPDATE' | 'DELETE',
    tableName: string,
  ) {
    const requestContext = RequestContextService.currentContext;
    const userId = requestContext?.user?.id;
    const username = requestContext?.user?.username;
    const ipAddress = requestContext?.req?.ip || '';
    const userAgent = requestContext?.req?.headers?.['user-agent'] || '';

    if (!userId || !username) return;

    const auditLog = new AuditLog();
    auditLog.tableName = tableName;
    auditLog.oldValue = oldValue;
    auditLog.newValue = newValue;
    auditLog.action = action;
    auditLog.userId = userId;
    auditLog.username = username;
    auditLog.ipAddress = ipAddress;
    auditLog.userAgent = userAgent;

    await this.dataSource.manager.save(auditLog);
  }
}
