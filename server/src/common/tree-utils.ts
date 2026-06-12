export function buildTree<T extends { children: T[] }>(
  nodes: T[],
  idGetter: (node: T) => number,
  parentIdGetter: (node: T) => number,
  sortGetter: (node: T) => number | null | undefined,
  childAppender: (parent: T, child: T) => void,
  rootParentId: number,
): T[] {
  const sorted = [...nodes].sort((a, b) => {
    const aSort = sortGetter(a) ?? Number.MAX_SAFE_INTEGER
    const bSort = sortGetter(b) ?? Number.MAX_SAFE_INTEGER
    return aSort - bSort
  })

  const nodeMap = new Map<number, T>()
  for (const node of sorted) {
    nodeMap.set(idGetter(node), node)
  }

  const roots: T[] = []
  for (const node of nodeMap.values()) {
    const parentId = parentIdGetter(node)
    const parent = nodeMap.get(parentId)
    if (!parent || parentId === rootParentId) {
      roots.push(node)
    } else {
      childAppender(parent, node)
    }
  }

  return roots
}
