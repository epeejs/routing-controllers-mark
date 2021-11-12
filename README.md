# routing-controllers-mark

为 [routing-controllers](https://github.com/typestack/routing-controllers) 提供自定义标记拦截能力，实现更加强大易用的切面编程

> 背景：对于一些需要对部分或全局做接口拦截的需求（如鉴权、验签等），常用做法是使用中间件，通过 UseBefore 或 UseAfter 局部或全局使用，但往往对于需要在中间件内读取路由元数据或部分接口不拦截时则无法直接实现
>
> 解决方案: 自定义标记+拦截

## 安装

```sh
yarn add @epeejs/routing-controllers-mark
```

## 特性

- 提供按组创建标记能力
- 支持正选与反选注解
- 拦截函数支持读取路由元数据能力

## 用法

### step1: 创建标记

```ts
import { createMark } from '@epeejs/routing-controllers-mark';

// 日志场景
const {
  Mark: Log,
  RemoveMark: NoLog,
  MarkMiddleware: LogMiddleware,
} = createMark({
  // 拦截函数，当请求接口被标记时执行
  action(context, route) {
    console.log(context, route);
  },
});

// 可以创建多组，互不影响
// 验签场景
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

### step2: 使用中间件（routing-controllers >= 0.8 版本时不需要这步）

```ts
useKoaServer(app, {
  middlewares: [LogMiddleware],
});
```

### step3: 标记需要拦截的接口

```ts
@Log()
@Service()
@JsonController('/posts')
export class PostController {
  constructor(private postRepository: PostRepository) {}

  // 反选
  @NoLog
  @Get('/')
  all() {
    return this.postRepository.findAll();
  }

  @Get('/:id')
  one(@Param('id') id: number) {
    return this.postRepository.findOne(id);
  }
}
```

## 原理

在使用注解时，会收集相关元数据，在中间件内映射当前请求到对应路由元数据，实现拦截能力

## API

### function createMark(options)

#### options.action

拦截函数，当请求接口被标记时执行

##### 定义

```ts
(context: Context, route: MarkRoute) => Promise<any> | void
```

##### 参数

- context：koa 上下文对象
- route：当前请求路由元数据

```ts
export interface MarkRoute {
  /** 接口控制器元数据 */
  controller: ControllerMetadataArgs;
  /** 接口方法元数据 */
  action: ActionMetadataArgs;
  /** 接口参数元数据 */
  params: ParamMetadataArgs[];
  /** 接口标记内容 */
  markContent: MarkContent;
}
export interface MarkContent<C = any, A = any> {
  /** 标记在 controller 上的内容 */
  controller?: C;
  /** 标记在 action 上的内容 */
  action?: A;
}
```

#### 返回值

```ts
export type MarkType = {
  /**
   * 给 action 或 controller 打上标记，标记 controller 时等于标记所有 action
   * @param content 标记信息
   */
  Mark: (content?: any) => ClassDecorator & MethodDecorator;
  /** 只能应用于 action ，用于部分排除*/
  RemoveMark: MethodDecorator;
  /** 拦截该标记的中间件 */
  MarkMiddleware: ClassType<KoaMiddlewareInterface>;
};
```

## 代办事项

- [ ] 优化路由元数据计算时机
- [ ] createMark options 增加 global 属性，支持全局应用拦截，同时支持部分排除
