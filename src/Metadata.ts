import { getMetadataStorage } from './MetadataStorage';

export default function genMetadata(key: symbol): MethodDecorator | ClassDecorator {
  return function Metadata(target: any, propertyKey?: string) {
    getMetadataStorage().push(key, {
      target: propertyKey ? target.constructor : target,
      method: propertyKey,
    });
  };
}
