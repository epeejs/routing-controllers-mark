import { chain } from 'lodash';
import { getMetadataArgsStorage } from 'routing-controllers';

export interface MetadataArgs {
  // eslint-disable-next-line @typescript-eslint/ban-types
  target: Function;
  method?: string | symbol;
  exclude?: boolean;
  data?: any;
}

class MetadataStorage {
  metadataMap = new Map<symbol, MetadataArgs[]>();

  static getRouteRegxStr(baseRoute: string, route: string | RegExp, type = 'get') {
    return `^${type} .*${baseRoute}${(route instanceof RegExp ? route.source : route)
      .split('/')
      .map((s) => (s[0] === ':' ? '.*' : s))
      .join('/')}$`;
  }

  push(key: symbol, metadata: MetadataArgs) {
    const metadatas = this.metadataMap.get(key) || [];
    this.metadataMap.set(key, [...metadatas, metadata]);
  }

  getMarkedRoutes(key: symbol) {
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

    return uniqRoutes.map(({ action, regxStr }) => {
      return {
        regxStr,
        markContent: {
          controller: includeMetadatas.find((n) => n.target === action.target && !n.method)?.data,
          action: includeMetadatas.find(
            (n) => n.method === action.method && n.target === action.target,
          )?.data,
        },
      };
    });
  }

  find(key: symbol, path: string) {
    const routes = this.getMarkedRoutes(key);

    return routes.find((m) => {
      const regx = new RegExp(m.regxStr);

      return regx.test(path);
    });
  }
}

let storage: MetadataStorage | null = null;

export function getMetadataStorage() {
  if (!storage) {
    storage = new MetadataStorage();
  }
  return storage;
}
