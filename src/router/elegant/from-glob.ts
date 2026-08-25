import { PAGE_DEGREE_SPLITTER, PATH_SPLITTER, elegantRouterConfig } from './config';
import type { PageFile, RouteTreeNode } from './types';

const PARAM_FILE = /^\[(\w+)\]\.[a-zA-Z]+$/;
const INDEX_FILE = /^index\.[a-zA-Z]+$/;

export function splitRouterName(name: string) {
  return name.split(PAGE_DEGREE_SPLITTER).reduce<string[]>((parts, segment) => {
    const parent = parts.at(-1);
    parts.push(parent ? `${parent}${PAGE_DEGREE_SPLITTER}${segment}` : segment);
    return parts;
  }, []);
}

export function transformRouterNameToPath(name: string) {
  return `${PATH_SPLITTER}${name.replaceAll(PAGE_DEGREE_SPLITTER, PATH_SPLITTER)}`;
}

export function toAliasImportPath(relativeFromRoot: string, alias = elegantRouterConfig.alias) {
  const posixPath = relativeFromRoot.replaceAll('\\', PATH_SPLITTER);

  for (const [name, target] of Object.entries(alias)) {
    if (posixPath === target) return name;
    if (posixPath.startsWith(`${target}${PATH_SPLITTER}`)) return `${name}${posixPath.slice(target.length)}`;
  }

  return posixPath;
}

/**
 * Elegant Router glob rules:
 * - `_` in a folder name becomes a path segment (`user_detail` → `/user/detail`)
 * - a folder that starts with `_` is omitted from the name (`_builtin/403` → `403`)
 * - `[id].vue` becomes a `:id` param
 */
export function parsePageGlob(glob: string): Omit<PageFile, 'importPath'> | null {
  const normalized = glob.replaceAll('\\', PATH_SPLITTER).replace(/^\.\//, '');
  const parts = normalized.split(PATH_SPLITTER).filter(Boolean);

  if (parts.length < 2) return null;

  const fileName = parts.at(-1)!;
  const rawDirs = parts.slice(0, -1);

  if (rawDirs.some(dir => dir === 'components' || dir === '.' || dir === '..')) return null;
  if (!INDEX_FILE.test(fileName) && !PARAM_FILE.test(fileName)) return null;

  const dirs = rawDirs.filter(dir => !dir.startsWith(PAGE_DEGREE_SPLITTER));

  if (!dirs.length) return null;

  const routeName = dirs.join(PAGE_DEGREE_SPLITTER).toLowerCase();
  const paramMatch = fileName.match(PARAM_FILE);
  const routeParamKey = paramMatch?.[1] ?? '';
  const routePath = routeParamKey
    ? `${transformRouterNameToPath(routeName)}/:${routeParamKey}`
    : transformRouterNameToPath(routeName);

  return {
    glob: normalized,
    routeName,
    routePath,
    routeParamKey
  };
}

export function createPageFile(glob: string, pageDir = elegantRouterConfig.pageDir): PageFile | null {
  const parsed = parsePageGlob(glob);
  if (!parsed) return null;

  return {
    ...parsed,
    importPath: toAliasImportPath(`${pageDir.replaceAll('\\', PATH_SPLITTER)}/${parsed.glob}`)
  };
}

export function createNamePathMap(files: PageFile[]) {
  const map = new Map<string, string>();

  files.forEach(file => {
    splitRouterName(file.routeName).forEach(name => {
      if (map.has(name)) return;

      map.set(name, name === file.routeName ? file.routePath : transformRouterNameToPath(name));
    });
  });

  return map;
}

export function buildRouteTrees(files: PageFile[]): RouteTreeNode[] {
  const maps = createNamePathMap(files);
  const entries = [...maps.entries()].sort(([current], [next]) => current.localeCompare(next));
  const buckets = new Map<string, string[][]>();

  entries.forEach(([name]) => {
    if (!name.includes(PAGE_DEGREE_SPLITTER)) {
      buckets.set(name, buckets.get(name) ?? []);
      return;
    }

    const rootName = name.split(PAGE_DEGREE_SPLITTER)[0]!;
    const degree = name.split(PAGE_DEGREE_SPLITTER).length;
    const levels = buckets.get(rootName) ?? [];
    const level = levels[degree - 2] ?? [];

    level.push(name);
    levels[degree - 2] = level;
    buckets.set(rootName, levels);
  });

  function toChildren(parentName: string, levels: string[][]): RouteTreeNode[] {
    const [currentLevel, ...rest] = levels;
    if (!currentLevel?.length) return [];

    return currentLevel
      .filter(name => name.startsWith(parentName))
      .map(name => {
        const node: RouteTreeNode = {
          routeName: name,
          routePath: maps.get(name) || ''
        };
        const children = toChildren(name, rest);
        if (children.length) node.children = children;
        return node;
      });
  }

  return [...buckets.entries()].map(([name, levels]) => {
    const node: RouteTreeNode = {
      routeName: name,
      routePath: maps.get(name) || ''
    };
    const children = toChildren(name, levels);
    if (children.length) node.children = children;
    return node;
  });
}
