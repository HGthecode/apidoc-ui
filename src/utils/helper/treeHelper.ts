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
