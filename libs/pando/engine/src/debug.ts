import type { AnyNode, CalcResult, PreRead, TagCache } from './node'
import { Calculator as BaseCalculator, map } from './node'
import type { Tag } from './tag'
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
  gathering = new Set<TagCache<DebugMeta>>()

  constructor(calc: BaseCalculator<any>, tagStr: TagStr) {
    super(calc.keys)
    this.nodes = calc.nodes
    this.tagStr = tagStr
    this.custom = calc.computeCustom
  }

  override _gather(cache: TagCache<DebugMeta>): PreRead<DebugMeta> {
    if (this.gathering.has(cache))
      throw new Error(`Loop detected for {this.tagStr(cache.tag)}`)
    this.gathering.add(cache)
    const result = this.__gather(cache)
    this.gathering.delete(cache)
    return result
  }

  __gather(cache: TagCache<DebugMeta>): PreRead<DebugMeta> {
    // The only thing we do differently from `super._gather` is adding
    // `note`, which requires `tag_db` debug mode. Skip if unavailable
    if (!isDebug('tag_db')) return super._gather(cache)
    if (cache.val) return cache.val

    const tags = this.nodes
      .debugTag(cache.id)
      .map((t) => (t ? this.tagStr(t) : '!!'))
    const pre = this.nodes.subset(cache.id).flatMap((n, i) => {
      if (n.op === 'reread') {
        return this._gather(cache.with(n.tag)).pre.map((x) => {
          // Must be a new object as `reread` entries are shared with regular `read`.
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
    return (cache.val = { pre })
  }
  override _compute(
    n: AnyNode,
    cache: TagCache<DebugMeta>
  ): CalcResult<any, DebugMeta> {
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
    if (typeof val !== 'number') val = `"${val}"`
    else if (Math.round(val) === val) val = `${val}`
    else val = val.toFixed(2)

    const result: DebugMeta = {
      note: '', // Force JSON ordering, delete if unused
      formula: `[${val}] ${this.nodeString(n)}`,
      deps: [
        ...x.map((x) => x?.meta).filter((x) => !!x),
        ...br.map((br) => br.meta),
      ].flatMap((x) => (x[isRead] ? [x] : x.deps)),
      [isRead]: n.op === 'read',
    }
    if (n.op === 'read') {
      tag = Object.fromEntries(Object.entries(tag!).filter(([_, v]) => v))
      result.note = `gather ${x.length} node(s) for ${this.tagStr(tag)}`
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
