# routing-controllers-mark

为 [routing-controllers](https://github.com/typestack/routing-controllers) 提供自定义标记拦截能力，实现更加强大易用的切面编程

## 用法

```ts
import { createMark } from '@epeejs/routing-controllers-mark';

const {
  Mark: Sign,
  RemoveMark: NoSign,
  MarkMiddleware: SignVerifyMiddleware,
} = createMark({
  action(context, route) {
    // ...sign verify
    // if (!paas) {
    //   throw new BadRequestError();
    // }
  },
});
```
