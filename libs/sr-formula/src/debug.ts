import type {
  AnyNode,
  ReRead,
  TagMapSubsetCache,
} from '@genshin-optimizer/pando'
import { TagMapExactValues, traverse } from '@genshin-optimizer/pando'
import type { Read, Tag } from './data/util'
import type { Calculator } from './calculator'

export function dependencyString(read: Read, calc: Calculator) {
  const str = listDependencies(read.tag, calc).map(({ tag, read, reread }) => {
    const result: any = { tag: tagString(tag) }
    if (read.length || reread.length)
      result.deps = [...read.map(tagString), ...reread.map(tagString)]
    return result
  })
  return str
}
export function tagString(tag: Tag): string {
  return `${Object.entries(tag)
    .filter(([_, v]) => v)
    .map(([k, v]) => `${k}:${v}`)
    .join(' ')}`
}

export function listDependencies(
  tag: Tag,
  calc: Calculator
): { tag: Tag; read: Tag[]; reread: Tag[] }[] {
  const result: { tag: Tag; read: Tag[]; reread: Tag[] }[] = [],
    stack: Tag[] = []
  /** Stack depth when first encountered the tag, or 0 if already visited */
  const tagKeys = calc.keys
  const openDepth = new TagMapExactValues<number>(tagKeys.tagLen, {})

  function internal(cache: TagMapSubsetCache<AnyNode | ReRead>) {
    const tag = cache.tag,
      depth = openDepth.refExact(tagKeys.get(tag))
    if (depth[0] > 0) {
      console.log(stack.slice(depth[0] - 1))
      throw new Error('Cyclical dependencies found')
    } else if (depth[0] == 0) return // Already visited
    depth[0] = stack.push(tag)

    const nodes = cache.subset(),
      read: Tag[] = [],
      reread: Tag[] = []
    const n = nodes.filter((x) => x.op !== 'reread') as AnyNode[]
    const re = nodes.filter((x) => x.op === 'reread') as ReRead[]
    result.push({ tag, read, reread })

    const tags = [tag]
    traverse(n, (n, map) => {
      switch (n.op) {
        case 'read': {
          const newTag = cache.with(n.tag)
          read.push(newTag.tag)
          internal(newTag)
          return
        }
        case 'tag': {
          tags.push({ ...tags.at(-1), ...n.tag })
          map(n.x[0])
          tags.pop()
          return
        }
      }
      n.x.forEach(map)
      n.br.forEach(map)
    })

    for (const { tag: extra } of re) {
      const newTag = cache.with(extra)
      internal(newTag)
      reread.push(newTag.tag)
    }

    depth[0] = 0
    stack.pop()
  }
  internal(calc.nodes.cache(calc.keys).with(tag))
  return result
}
