import type { AnyNode, CalcResult, PreRead, ReRead, TagCache } from './node'
import { Calculator as BaseCalculator, map } from './node'
import type { Tag, TagMapEntries, TagMapEntry } from './tag'
import { entryRef } from './tag/symb'

type TagStr = (tag: Tag, ex?: any) => string

/** Sequence of entries matched by gathering, in reverse order (final entry first) */
type ReadSeq = [TagMapEntry<AnyNode>, ...TagMapEntries<ReRead>]
export type DebugMeta = {
  readSeq?: ReadSeq
  formula: string
  deps: DebugMeta[]

  isRead: boolean
  toJSON(): any
}
export class DebugCalculator extends BaseCalculator<DebugMeta> {
  tagStr: TagStr
  gathering = new Set<TagCache<DebugMeta>>()

  constructor(calc: BaseCalculator<any>, tagStr: TagStr) {
    super(calc.cache.keys)
    this.nodes = calc.nodes
    this.tagStr = tagStr
    this.cache = this.cache.with(calc.cache.tag)
  }
  override withTag(_tag: Tag): this {
    throw new Error('Unimplemented')
  }

  override _gather(cache: TagCache<DebugMeta>): PreRead<DebugMeta> {
    if (this.gathering.has(cache)) throw new Error(`Loop detected`)
    this.gathering.add(cache)
    const result = this.__gather(cache)
    this.gathering.delete(cache)
    return result
  }

  __gather(cache: TagCache<DebugMeta>): PreRead<DebugMeta> {
    if (cache.val) return cache.val

    const entries: TagMapEntries<AnyNode | ReRead> = []
    this.nodes._subset(cache.id, (l) => entries.push(...(l[entryRef] ?? [])))

    const pre = this.nodes
      .subset(cache.id)
      .flatMap((n, i) =>
        n.op === 'reread'
          ? this._gather(cache.with(n.tag)).pre.map((x) => [x, n, i] as const)
          : [[this._compute(n, cache), n as AnyNode | ReRead, i] as const]
      )
      .map(([x, n, i]) => this.markGathered(cache.tag, n, x, entries[i]))
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
          formula: `err: ${(e as any).message} in ${this.tagStr(
            cache.tag
          )}: ${nodeString(n, this.tagStr)}`,
          deps: [],
          isRead: true,
          toJSON: metaToJSON(this.tagStr),
        },
      }
    }
  }

  override markGathered(
    _tag: Tag,
    _n: AnyNode | ReRead | undefined,
    { val, meta }: CalcResult<number | string, DebugMeta>,
    entry?: TagMapEntry<AnyNode | ReRead>
  ): CalcResult<number | string, DebugMeta> {
    meta = { ...meta, readSeq: [...(meta.readSeq ?? []), entry] as ReadSeq }
    return Object.freeze({ val, meta })
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
      formula: `[${val}] ${nodeString(n, this.tagStr)}`,
      deps: [
        ...x.map((x) => x?.meta).filter((x) => !!x),
        ...br.map((br) => br.meta),
      ].flatMap((x) => (x.isRead ? [x] : x.deps)),
      isRead: n.op === 'read',
      toJSON: metaToJSON(this.tagStr),
    }
    if (n.op === 'read') {
      tag = Object.fromEntries(Object.entries(tag!).filter(([_, v]) => v))
      result.formula = `gather ${x.length} node(s) for ${this.tagStr(
        n.tag
      )} (${this.tagStr(tag)})`
      result.deps = x.map((x) => x!.meta)
    }
    return result
  }
}

function nodeString(node: AnyNode, tagStr: TagStr): string {
  return map([node], (node, map: (n: AnyNode) => string) => {
    const { op, tag, br, x } = node
    let { ex } = node
    if (op === 'const') return `${ex}`
    if (op === 'read') return tagStr(tag, ex)
    if (op === 'subscript') ex = undefined
    const args: string[] = []
    if (ex) args.push(JSON.stringify(ex))
    if (tag) args.push(tagStr(tag))
    args.push(...br.map(map), ...x.map(map))
    return `${op}(` + args.join(', ') + ')'
  })[0]
}

function metaToJSON(tagStr: TagStr): (this: DebugMeta) => any {
  return function (this: DebugMeta): any {
    const { readSeq, formula, deps } = this
    let readStr
    if (readSeq?.some((e) => !!e)) {
      const [head, ...rem] = readSeq
      let str = ''
      for (let i = rem.length - 1; i >= 0; i--) {
        if (rem[i]) {
          const { tag: dst, value } = rem[i]
          str += `${tagStr(dst)} <= ${tagStr(value.tag)} : `
        } else str += '!! : '
      }
      readStr = str + (head ? `matches ${tagStr(head.tag)}` : '!!')
    }
    return { ...(readStr && { readSeq: readStr }), formula, deps }
  }
}
