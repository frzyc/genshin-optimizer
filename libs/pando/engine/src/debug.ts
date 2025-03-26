import type { AnyNode, BaseRead, CalcResult, PreRead, TagCache } from './node'
import { Calculator as BaseCalculator } from './node'
import { arithmetic } from './node/formula'
import type { Tag } from './tag'

type TagStr = (tag: Tag, ex?: any) => string
type Predicate = (debug: DebugMeta) => boolean

export interface DebugMeta {
  readSeq?: string
  formula: string
  deps: DebugMeta[]
  omitted: DebugMeta[]

  val: number | string
  x: DebugMeta[]
  br: DebugMeta[]

  comp: string
  pivot: boolean
  toJSON: (this: DebugMeta) => any
}
export class DebugCalculator extends BaseCalculator<DebugMeta> {
  tagStr: TagStr
  filter: Predicate
  override defaultAccu: (tag: Tag) => BaseRead['ex']
  gathering = new Set<TagCache<DebugMeta>>()

  constructor(
    calc: BaseCalculator<any>,
    tagStr: TagStr,
    filter: Predicate = () => true
  ) {
    super(calc.cache.keys)
    this.nodes = calc.nodes
    this.tagStr = tagStr
    this.filter = filter
    this.defaultAccu = (tag) => calc.defaultAccu(tag)
    this.cache = this.cache.with(calc.cache.tag)
  }
  override withTag(_tag: Tag): this {
    throw new Error('Unimplemented')
  }

  override _gather(cache: TagCache<DebugMeta>): PreRead<DebugMeta> {
    if (this.gathering.has(cache))
      throw new Error(`Loop detected for ${this.tagStr(cache.tag)}`)
    this.gathering.add(cache)
    const result = this.__gather(cache)
    this.gathering.delete(cache)
    return result
  }

  __gather(cache: TagCache<DebugMeta>): PreRead<DebugMeta> {
    if (cache.val) return cache.val
    const pre = this.nodes.entries(cache.id).flatMap(({ tag, value: n }) =>
      n.op === 'reread'
        ? this._gather(cache.with(n.tag)).pre.map((x) => {
            const readSeq = `${this.tagStr(tag)} <= ${this.tagStr(n.tag)} : ${x.meta.readSeq}`
            return Object.freeze({ ...x, meta: { ...x.meta, readSeq } })
          })
        : [this.markGathered(cache.tag, tag, n, this._compute(n, cache))]
    )
    return (cache.val = { pre })
  }

  override _compute(
    n: AnyNode,
    cache: TagCache<DebugMeta>
  ): CalcResult<any, DebugMeta> {
    try {
      return super._compute(n, cache)
    } catch (e) {
      return Object.freeze({
        val: NaN,
        meta: {
          formula: `${e}`,
          deps: [],
          omitted: [],

          val: NaN,
          x: [],
          br: [],
          comp: 'ERR',
          pivot: true,
          toJSON,
        },
      })
    }
  }

  override markGathered(
    tag: Tag,
    entryTag: Tag,
    _n: AnyNode | undefined,
    result: CalcResult<number | string, DebugMeta>
  ): CalcResult<number | string, DebugMeta> {
    const readSeq = `${this.tagStr(entryTag)} <- ${this.tagStr(tag)}`
    return { ...result, meta: { ...result.meta, readSeq, pivot: true } }
  }
  override computeMeta(
    n: AnyNode,
    val: number | string,
    _x: (CalcResult<number | string, DebugMeta> | undefined)[],
    _br: CalcResult<number | string, DebugMeta>[],
    tag: Tag | undefined
  ): DebugMeta {
    let comp: string, formula: string | undefined
    const x = _x.filter((n) => n!).map((n) => n!.meta)
    const br = _br.map((n) => n.meta)
    const args: DebugMeta[] = []
    const op = n.op === 'read' ? n.ex : n.op
    const omitted: DebugMeta[] = []
    if (op! in arithmetic) {
      const ignorable = arithmetic[op as keyof typeof arithmetic]([], undefined)
      for (const arg of [...br, ...x])
        if (arg.val !== ignorable || this.filter(arg)) args.push(arg)
        else omitted.push(arg)
    } else args.push(...br, ...x)
    switch (n.op) {
      case 'const':
        comp = valStr(n.ex)
        break
      case 'read':
        formula = `gather ${x.length} node(s)`
        formula += ` matching ${this.tagStr(tag!, n.ex)}`
        formula += ` (for ${this.tagStr(n.tag!)})`
        if (omitted.length) formula += ` <${omitted.length} omitted>`
        comp = `${this.tagStr(n.tag!)}`
        break
      default: {
        const argStrs: string[] = []
        if (n.ex && n.op !== 'subscript') argStrs.push(JSON.stringify(n.ex))
        if (n.tag) argStrs.push(this.tagStr(n.tag))
        argStrs.push(...args.map((m) => m.comp))
        if (omitted.length) argStrs.push(`<${omitted.length} omitted>`)
        comp = `${n.op}(` + argStrs.join(', ') + `)`
      }
    }
    omitted.push(...args.flatMap((m) => (m.pivot ? [] : m.omitted)))
    return Object.freeze({
      formula: `[${valStr(val)}] ${formula ?? comp}`,
      deps: [...new Set(args.flatMap((m) => (m.pivot ? [m] : m.deps)))],
      omitted: [...new Set(omitted)],

      val,
      x,
      br,
      comp,
      pivot: n.op === 'read',
      toJSON,
    })
  }
}

const valStr = (val: number | string) =>
  typeof val === 'string' ? `"${val}"` : val.toString()
function toJSON(this: DebugMeta) {
  const { formula, readSeq, deps } = this
  const result: any = { readSeq, formula, deps }
  if (!result.readSeq) delete result.readSeq
  if (!result.deps.length) delete result.deps
  if (Object.keys(result).length === 1) return result.formula
  return result
}
