# @epeejs/routing-controllers-metadata

提供 routing-controllers 元数据能力，实现更加强大易用的切面编程

## 用法

```ts
import { createMetadata } from '@epeejs/routing-controllers-metadata';
import { Context } from 'koa';

const {
  Metadata: Sign,
  NoMetadata: NoSign,
  MetadataMiddleware: SignVerifyMiddleware,
} = createMetadata({
  action(context: Context) {
    // ...intercept action
  },
});
```
