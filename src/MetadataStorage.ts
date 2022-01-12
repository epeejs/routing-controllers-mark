import { chain } from 'lodash';
import { getMetadataArgsStorage } from 'routing-controllers';
import type { ActionMetadataArgs } from 'routing-controllers/metadata/args/ActionMetadataArgs';
import type { ControllerMetadataArgs } from 'routing-controllers/metadata/args/ControllerMetadataArgs';
import type { ParamMetadataArgs } from 'routing-controllers/metadata/args/ParamMetadataArgs';

export interface MetadataArgs {
  // eslint-disable-next-line @typescript-eslint/ban-types
  target: Function;
  method?: string | symbol;
  exclude?: boolean;
  data?: any;
}

export interface MarkContent<C = any, A = any> {
  /** 标记在 controller 上的内容 */
  controller?: C;
  /** 标记在 action 上的内容 */
  action?: A;
}

export interface MarkRoute {
  /** 接口标记内容 */
  markContent: MarkContent;
  /** 接口控制器元数据 */
  controller: ControllerMetadataArgs;
  /** 接口方法元数据 */
  action: ActionMetadataArgs;
  /** 接口参数元数据 */
  params: ParamMetadataArgs[];
}

interface MarkRouteRules extends MarkRoute {
  /** 匹配路径正则 */
  test: RegExp;
}

class MetadataStorage {
  metadataMap = new Map<symbol, MetadataArgs[]>();
  cacheMarkRouteRuleMap = new Map<symbol, MarkRouteRules[]>();

  static getRouteRegxStr(baseRoute: string, route: string | RegExp, type = 'get') {
    return `^${type} .*${baseRoute}${(route instanceof RegExp ? route.source : route)
      .split('/')
      .map((s) => (s[0] === ':' ? '.+' : s))
      .join('/')}$`;
  }

  push(key: symbol, metadata: MetadataArgs) {
    const metadatas = this.metadataMap.get(key) || [];
    this.metadataMap.set(key, [...metadatas, metadata]);
  }

  getMarkRouteRules(key: symbol) {
    // 如果存在路由规则缓存，则直接返回
    const cache = this.cacheMarkRouteRuleMap.get(key);

    if (cache) {
      return cache;
    }
    const storage = getMetadataArgsStorage();
    const metadatas = this.metadataMap.get(key) || [];
    const excludeActions = metadatas.filter((m) => m.exclude);
    const includeMetadatas = metadatas.filter((m) => !m.exclude);
    const routes = includeMetadatas.map((m) => {
      const controller = storage.controllers.find((n) => n.target === m.target)!;
      const actions = storage.actions.filter((n) => n.target === m.target);
      const controllerRoute = controller.route ?? '';

      // action
      if (m.method) {
        const action = actions.find((n) => n.method === m.method)!;

        return {
          regxStr: MetadataStorage.getRouteRegxStr(controllerRoute, action.route, action.type),
          action,
          controller,
        };
        // controller
      } else {
        return actions
          .filter(
            (n) => !excludeActions.some((a) => a.target === n.target && a.method === n.method),
          )
          .map((n) => ({
            regxStr: MetadataStorage.getRouteRegxStr(controllerRoute, n.route, n.type),
            action: n,
            controller,
          }));
      }
    });
    const uniqRoutes = chain(routes)
      .flatten()
      .uniqBy((m) => m.regxStr)
      .value();
    const routeRules: MarkRouteRules[] = uniqRoutes.map(({ action, regxStr, controller }) => {
      const params = storage.filterParamsWithTargetAndMethod(action.target, action.method);

      return {
        test: new RegExp(regxStr),
        markContent: {
          controller: includeMetadatas.find((n) => n.target === action.target && !n.method)?.data,
          action: includeMetadatas.find(
            (n) => n.method === action.method && n.target === action.target,
          )?.data,
        },
        action,
        controller,
        params,
      };
    });

    // 写入缓存
    this.cacheMarkRouteRuleMap.set(key, routeRules);

    return routeRules;
  }

  find(key: symbol, path: string): MarkRoute | undefined {
    const routeRules = this.getMarkRouteRules(key);
    const route = routeRules.find((m) => m.test.test(path));

    if (route) {
      const { test, ...otherData } = route;

      return otherData;
    }

    return route;
  }
}

let storage: MetadataStorage | null = null;

export function getMetadataStorage() {
  if (!storage) {
    storage = new MetadataStorage();
  }
  return storage;
}
