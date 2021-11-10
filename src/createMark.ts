import type { Context } from 'koa';
import type { MarkDecorator } from './createMarkDecorator';
import createMarkDecorator from './createMarkDecorator';
import type { MarkMiddlewareType } from './createMarkMiddleware';
import createMarkMiddleware from './createMarkMiddleware';
import type { MarkRoute } from './MetadataStorage';

export interface MarkOptions {
  action: (context: Context, route: MarkRoute) => Promise<any> | void;
}
export type MarkType = MarkDecorator & {
  MarkMiddleware: MarkMiddlewareType;
};

export default function createMark(options: MarkOptions): MarkType {
  const key = Symbol();
  const { action } = options;
  const { Mark, RemoveMark } = createMarkDecorator(key);
  const MarkMiddleware = createMarkMiddleware(key, action);

  return {
    MarkMiddleware,
    Mark,
    RemoveMark,
  };
}
