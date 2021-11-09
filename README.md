# routing-controllers-metadata

提供 routing-controllers 元数据能力，实现更加强大易用的切面编程

## 用法

```ts
import { createMark } from '@epeejs/routing-controllers-metadata';
import { Context } from 'koa';

const {
  Mark: Sign,
  RemoveMark: NoSign,
  MarkMiddleware: SignVerifyMiddleware,
} = createMark({
  action(context: Context, next) {
    // ...sign verify
    next();
  },
});
```
