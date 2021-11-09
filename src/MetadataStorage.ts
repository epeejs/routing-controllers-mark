import { chain } from 'lodash';
import { getMetadataArgsStorage } from 'routing-controllers';

export interface MetadataArgs {
  target: Function;
  method?: string | symbol;
  exclude?: boolean;
}

class MetadataStorage {
  metadataMap = new Map<symbol, MetadataArgs[]>();

  static getRouteRegStr(baseRoute: string, route: string | RegExp, type = 'get') {
    return `^${type} .*${baseRoute}${(route instanceof RegExp ? route.source : route)
      .split('/')
      .map((s) => (s[0] === ':' ? '.*' : s))
      .join('/')}$`;
  }
  push(key: symbol, metadata: MetadataArgs) {
    const metadatas = this.metadataMap.get(key) || [];
    this.metadataMap.set(key, [...metadatas, metadata]);
  }
  getPathRegs(key: symbol) {
    const storage = getMetadataArgsStorage();
    const metadatas = this.metadataMap.get(key) || [];
    const needExcludeActions = metadatas.filter((m) => m.exclude);
    const pathRegs = metadatas
      .filter((m) => !m.exclude)
      .map((m) => {
        const controllerRoute = storage.controllers.find((n) => n.target === m.target)!.route ?? '';
        const actions = storage.actions.filter((n) => n.target === m.target);

        // action
        if (m.method) {
          const action = actions.find((n) => n.method === m.method)!;

          return MetadataStorage.getRouteRegStr(controllerRoute, action.route, action.type);
          // controller
        } else {
          return actions
            .filter(
              (n) =>
                !needExcludeActions.some((a) => a.target === n.target && a.method === n.method),
            )
            .map((n) => MetadataStorage.getRouteRegStr(controllerRoute, n.route, n.type));
        }
      });

    return chain(pathRegs)
      .flatten()
      .uniq()
      .value()
      .map((m) => new RegExp(m));
  }
  match(key: symbol, path: string) {
    const regs = this.getPathRegs(key);
    return regs.some((m) => m.test(path));
  }
}

let storage: MetadataStorage | null = null;

export function getMetadataStorage() {
  if (!storage) {
    storage = new MetadataStorage();
  }
  return storage;
}
