import { getMetadataStorage } from './MetadataStorage';

export default function genNoMetadata(key: symbol): MethodDecorator {
  return function NoMetadata(target, propertyKey) {
    getMetadataStorage().push(key, {
      target: target.constructor,
      method: propertyKey,
      exclude: true,
    });
  };
}
