import type {
  AnyNode,
  CalcResult,
  Calculator,
  PreRead,
  ReRead,
  TagCache,
} from './node'
import { Calculator as BaseCalculator, map, traverse } from './node'
import type { Tag, TagMapSubsetCache } from './tag'
import { TagMapExactValues } from './tag'
import { isDebug } from './util'

const isRead = Symbol()
type TagStr = (tag: Tag, ex?: any) => string

export type DebugMeta = {
  note?: string
  formula: string
  deps: DebugMeta[]
  [isRead]: boolean
}
export class DebugCalculator extends BaseCalculator<DebugMeta> {
  tagStr: TagStr
  custom: typeof this.computeCustom

  constructor(calc: BaseCalculator<any>, tagStr: TagStr) {
    super(calc.keys)
    this.nodes = calc.nodes
    this.tagStr = tagStr
    this.custom = calc.computeCustom
  }

  checkCycle(tag: Tag) {
    checkCycle(tag, this)
  }

  override _gather(cache: TagCache): PreRead<DebugMeta> {
    // The only thing we do differently from `super` is adding `note`,
    // which requires `tag_db` debug mode. Skip if it is unavailable
    if (!isDebug('tag_db')) return super._gather(cache)

    const result = this.calculated.refExact(cache.id)
    if (result.length) return result[0]!

    const tags = cache.tags().map((t) => (t ? this.tagStr(t) : '!!'))
    for (const entry of cache.internal.entries) {
      if (entry.tags.length != entry.values.length) {
        console.log(entry)
      }
    }
    const pre = cache.subset().flatMap((n, i) => {
      if (n.op === 'reread') {
        return this._gather(cache.with(n.tag)).pre.map((x) => {
          // Must be a new object in case `reread` entry is shared with a regular `read`.
          // They would have the same `val` and `meta` but different `note`.
          x = { ...x, meta: { ...x.meta } }
          x.meta.note = `${tags[i]} <= ${this.tagStr(n.tag)} : ${x.meta.note!}`
          return x
        })
      } else {
        const { val, meta } = this._compute(n, cache)
        return Object.freeze({
          val,
          meta: {
            note: `${tags[i]} <- ${this.tagStr(cache.tag)}`,
            ...meta,
          },
        })
      }
    })
    result.push({ pre })
    return result[0]!
  }
  override _compute(n: AnyNode, cache: TagCache): CalcResult<any, DebugMeta> {
    try {
      return super._compute(n, cache)
    } catch (e) {
      return {
        val: NaN,
        meta: {
          note: `err: ${(e as any).message} in ${this.tagStr(cache.tag)}`,
          formula: this.nodeString(n),
          deps: [],
          [isRead]: true,
        },
      }
    }
  }

  override computeMeta(
    n: AnyNode,
    val: number | string,
    x: (CalcResult<number | string, DebugMeta> | undefined)[],
    br: CalcResult<number | string, DebugMeta>[],
    tag: Tag | undefined
  ): DebugMeta {
    function valStr(val: number | string): string {
      if (typeof val !== 'number') return `"${val}"`
      if (Math.round(val) === val) return `${val}`
      return val.toFixed(2)
    }

    const result: DebugMeta = {
      note: '',
      formula: `[${valStr(val)}] ${this.nodeString(n)}`,
      deps: [
        ...x.map((x) => x?.meta).filter((x) => !!x),
        ...br.map((br) => br.meta),
      ].flatMap((x) => (x[isRead] ? [x] : x.deps)),
      [isRead]: n.op === 'read',
    }
    if (n.op === 'read') {
      tag = Object.fromEntries(Object.entries(tag!).filter(([_, v]) => v))
      result.note = `gather ${x.length} nodes for ${this.tagStr(tag)}`
      result.formula = `[${valStr(val)}] read ${this.nodeString(n)}`
      result.deps = x.map((x) => x!.meta)
    } else delete result.note
    return result
  }

  override computeCustom(args: (number | string)[], op: string): any {
    return this.custom(args, op)
  }

  nodeString(node: AnyNode): string {
    return map([node], (node, map: (n: AnyNode) => string) => {
      const { op, tag, br, x } = node
      let { ex } = node
      if (op === 'const') return `${ex}`
      if (op === 'read') return this.tagStr(tag, ex)
      if (op === 'subscript') ex = undefined
      const args: string[] = []
      if (ex) args.push(JSON.stringify(ex))
      if (tag) args.push(this.tagStr(tag))
      args.push(...br.map(map), ...x.map(map))
      return `${op}(` + args.join(', ') + ')'
    })[0]
  }
}

function checkCycle(tag: Tag, calc: Calculator) {
  const stack: Tag[] = []
  const tagKeys = calc.keys
  /** Stack depth when first encountered the tag, or 0 if already visited */
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
