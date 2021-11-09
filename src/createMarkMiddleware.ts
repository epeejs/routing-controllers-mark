import type { Context } from 'koa';
import type { KoaMiddlewareInterface } from 'routing-controllers';
import { Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import type { MarkOptions } from './createMark';
import { getMetadataStorage } from './MetadataStorage';

export declare type ClassType<T> = {
  new (...args: any[]): T;
};
export type MarkMiddlewareType = ClassType<KoaMiddlewareInterface>;

export default function createMarkMiddleware(
  key: symbol,
  action: MarkOptions['action'],
): MarkMiddlewareType {
  @Service()
  @Middleware({ type: 'before' })
  class MarkMiddleware implements KoaMiddlewareInterface {
    async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
      const method = context.method.toLowerCase();
      const route = getMetadataStorage().find(key, `${method} ${context.request.path}`);

      if (route && action) {
        await action(context, next, route.markContent);
        return;
      }

      return next();
    }
  }

  return MarkMiddleware;
}
