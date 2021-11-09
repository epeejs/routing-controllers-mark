import type { Context } from 'koa';
import type { KoaMiddlewareInterface } from 'routing-controllers';
import { Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import type { MetadataOptions } from './createMetadata';
import { getMetadataStorage } from './MetadataStorage';

export default function genMetadataMiddleware(key: symbol, action: MetadataOptions['action']): any {
  @Service()
  @Middleware({ type: 'before' })
  class MetadataMiddleware implements KoaMiddlewareInterface {
    async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
      const method = context.method.toLowerCase();
      const hit = getMetadataStorage().match(key, `${method} ${context.request.path}`);

      if (hit && action) {
        await action(context, next);
        return;
      }

      return next();
    }
  }
  return MetadataMiddleware;
}
