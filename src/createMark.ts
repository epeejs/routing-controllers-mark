import type { Context } from 'koa';
import type { MarkDecorator } from './createMarkDecorator';
import createMarkDecorator from './createMarkDecorator';
import type { MarkMiddlewareType } from './createMarkMiddleware';
import createMarkMiddleware from './createMarkMiddleware';

export interface MarkContent<C = any, A = any> {
  /** 标记在 controller 上的内容 */
  controller?: C;
  /** 标记在 action 上的内容 */
  action?: A;
}

export interface MarkOptions {
  action: (
    context: Context,
    next: (err?: any) => Promise<any>,
    markContent: MarkContent,
  ) => Promise<any> | void;
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
