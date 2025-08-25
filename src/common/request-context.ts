import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  req?: {
    ip?: string;
    headers?: {
      'user-agent'?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  user?: {
    id: string;
    username: string;
    [key: string]: any;
  };
}

export class RequestContextService {
  private static readonly storage = new AsyncLocalStorage<RequestContext>();

  static get currentContext(): RequestContext | undefined {
    return this.storage.getStore();
  }

  static run(context: RequestContext, callback: () => void) {
    this.storage.run(context, callback);
  }
}
