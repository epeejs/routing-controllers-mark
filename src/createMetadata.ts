import type { Context } from 'koa';
import genMetadata from './Metadata';
import genMetadataMiddleware from './MetadataMiddleware';
import genNoMetadata from './NoMetadata';

export interface MetadataOptions {
  action: (context: Context, next: (err?: any) => Promise<any>) => Promise<any> | void;
}

export default function createMetadata(options: MetadataOptions) {
  const key = Symbol();
  const { action } = options;

  return {
    MetadataMiddleware: genMetadataMiddleware(key, action),
    Metadata: genMetadata(key),
    NoMetaData: genNoMetadata(key),
  };
}
