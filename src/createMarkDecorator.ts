import { getMetadataStorage } from './MetadataStorage';

export interface MarkDecorator {
  /**
   * 给 action 或 controller 打上标记，标记 controller 时等于标记所有 action
   * @param content 标记信息
   */
  Mark: (content?: any) => ClassDecorator & MethodDecorator;
  /** 只能应用于 action ，用于部分排除 */
  RemoveMark: MethodDecorator;
}

export default function createMarkDecorator(key: symbol): MarkDecorator {
  const Mark = function (content?: any) {
    return function (target: any, propertyKey?: string | symbol) {
      getMetadataStorage().push(key, {
        target: propertyKey ? target.constructor : target,
        method: propertyKey,
        data: content,
      });
    };
  };
  const RemoveMark: MethodDecorator = function (target, propertyKey) {
    getMetadataStorage().push(key, {
      target: target.constructor,
      method: propertyKey,
      exclude: true,
    });
  };

  return {
    Mark,
    RemoveMark,
  };
}
