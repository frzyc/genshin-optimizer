import type { AnyNode, Calculator, ReRead } from './node'
import { traverse } from './node'
import type { Tag, TagMapSubsetCache } from './tag'
import { TagMapExactValues } from './tag'
export * from './debugCalc'

export function detectCycle(tag: Tag, calc: Calculator) {
  const stack: Tag[] = []
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

    const nodes = cache.subset()
    const n = nodes.filter((x) => x.op !== 'reread') as AnyNode[]
    const re = nodes.filter((x) => x.op === 'reread') as ReRead[]

    traverse(n, (n, map) => {
      switch (n.op) {
        case 'read': {
          const newTag = cache.with(n.tag)
          internal(newTag)
          return
        }
        case 'tag': {
          map(n.x[0])
          return
        }
        case 'dtag':
          console.warn('Ignored dtag node while checking for cycles')
      }
      n.x.forEach(map)
      n.br.forEach(map)
    })

    for (const { tag: extra } of re) {
      const newTag = cache.with(extra)
      internal(newTag)
    }

    depth[0] = 0
    stack.pop()
  }
  internal(calc.nodes.cache(calc.keys).with(tag))
}
