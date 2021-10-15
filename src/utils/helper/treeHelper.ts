export function getFirstNode<T = any>(tree: T[], childrenField = "children"): T[] {
  const temp: T[] = [];

  function listFun(list: T[]) {
    if (list && list.length > 0) {
      const node: any = list[0];
      temp.push(node);
      node[childrenField] && listFun(node[childrenField]);
    }
  }
  listFun(tree);

  return temp;
}

export function filterTree<T = any>(
  tree: T[],
  func: (n: T) => boolean,
  childrenField = "children"
): T[] {
  function listFilter(list: T[]) {
    return list
      .map((node: any) => ({ ...node }))
      .filter((node: any) => {
        node[childrenField] = node[childrenField] && listFilter(node[childrenField]);
        return func(node) || (node[childrenField] && node[childrenField].length);
      });
  }

  return listFilter(tree);
}

export function getTreeValueByField<T = any>(
  tree: T[],
  field = "menu_key",
  childrenField = "children"
): string[] {
  const values: string[] = [];
  function listFun(list: T[]) {
    for (let i = 0; i < list.length; i++) {
      const node: any = list[i];
      values.push(node[field]);
      if (node[childrenField]) {
        listFun(node[childrenField]);
      }
    }
  }
  listFun(tree);
  return values;
}

export function findNode<T = any>(
  tree: T[],
  func: (n: T) => boolean,
  childrenField = "children"
): T | null {
  const list = [...tree];
  for (let i = 0; i < list.length; i++) {
    const node: any = list[i];
    if (func(node)) return node;
    node[childrenField] && list.push(...node[childrenField]);
  }
  return null;
}

export function getTreePath<T = any>(
  tree: T[],
  func: (n: T) => boolean,
  path: string[] = [],
  key = "menu_key",
  childrenField = "children"
): string[] {
  if (!tree) return [];
  for (let i = 0; i < tree.length; i++) {
    const item: any = tree[i];
    path.push(item[key]);
    if (func(item)) return path;
    if (item[childrenField]) {
      const findChildren: any = getTreePath(item[childrenField], func, path, key, childrenField);
      if (findChildren.length) return findChildren;
    }
    path.pop();
  }
  return [];
}

export function getTreePathByKeys<T = any>(
  tree: T[],
  keys: string[],
  key = "",
  path: any[] = [],
  field = "name",
  childrenField = "children"
): T[] | null {
  if (!tree) return [];
  for (let i = 0; i < tree.length; i++) {
    const item: any = tree[i];
    path.push(item);
    const keyIndex = keys.findIndex((p) => p === key);
    if (item[field] === key && keyIndex >= keys.length - 1) {
      return path;
    }
    if (item[childrenField]) {
      const findChildren: any = getTreePathByKeys(
        item[childrenField],
        keys,
        keys[keyIndex + 1],
        path,
        field,
        childrenField
      );
      if (findChildren.length) return findChildren;
    }
    path.pop();
  }
  return [];
}
