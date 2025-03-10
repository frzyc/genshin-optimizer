import { assertUnreachable } from '@genshin-optimizer/common/util'
import type { AnyNode, CalcResult } from '@genshin-optimizer/pando/engine'
import {
  Calculator as BaseCalculator,
  calculation,
} from '@genshin-optimizer/pando/engine'
import type { Member, Read, Sheet, Tag } from './read'
import { reader } from './read'

type MemRec<Member extends string, V> = Partial<Record<Member, V>>
type SingleCondInfo<Sheet extends string> = Partial<
  Record<Sheet, Record<string, string | number>>
>
export type SrcCondInfo<Member extends string, Sheet extends string> = MemRec<
  Member,
  SingleCondInfo<Sheet>
>
/// conds[dst][src][sheet][name]
type CondInfo<Member extends string, Sheet extends string> = MemRec<
  Member,
  SrcCondInfo<Member, Sheet>
>

/// `op`s that appear in `Meta['op']`, inserted by the Calculator.computeMeta
type MetaOp = 'sum' | 'prod' | 'min' | 'max' | 'sumfrac' | 'const'
export interface CalcMeta<Tag_ extends Tag, COp = never> extends Info<Tag_> {
  tag?: Tag_
  op: MetaOp | COp
  ops: CalcResult<number, CalcMeta<Tag_, COp>>[]
}
interface Info<Tag_ extends Tag> {
  usedCats: Set<keyof Tag_>
  conds: CondInfo<Member<Tag_> | 'All', Sheet<Tag_>>
}

const { arithmetic } = calculation

export class Calculator<
  Tag_ extends Tag = Tag,
  COp = never // values of supported `Custom['ex']` if any
> extends BaseCalculator<CalcMeta<Tag_, COp>> {
  override computeMeta(
    { op, ex, tag: nTag }: AnyNode,
    val: number | string,
    _x: (CalcResult<number | string, CalcMeta<Tag_, COp>> | undefined)[],
    br: CalcResult<number | string, CalcMeta<Tag_, COp>>[],
    tag: Tag_ | undefined
  ): CalcMeta<Tag_, COp> {
    let x = _x.filter((x) => !!x) as CalcResult<number, CalcMeta<Tag_, COp>>[]
    const info = extractInfo(x, br)

    function finalize(meta: CalcMeta<Tag_, COp>): CalcMeta<Tag_, COp> {
      return Object.freeze(tag && !meta.tag ? { tag, ...meta } : meta) // use inner tag when available
    }

    function newMeta(
      op: MetaOp | COp,
      ops: CalcResult<number, CalcMeta<Tag_, COp>>[]
    ): CalcMeta<Tag_, COp> {
      return finalize({ op, ops, ...info })
    }
    function wrap(
      result: CalcResult<number | string, CalcMeta<Tag_, COp>>,
      extraCats?: (keyof Tag_)[]
    ): CalcMeta<Tag_, COp> {
      let { meta } = result
      if (extraCats?.some((c) => !meta.usedCats.has(c)))
        meta = { ...meta, usedCats: new Set([...meta.usedCats, ...extraCats]) }
      return finalize(meta.conds === info.conds ? meta : { ...meta, ...info })
    }

    if (op === 'read' && tag?.qt === 'cond') {
      const { src, dst, sheet, q } = tag
      if (src && sheet && q)
        info.conds = merge(info.conds, {
          [dst ?? 'All']: { [src]: { [sheet!]: { [q!]: val } } },
        })
    }
    if (op === 'read' && ex !== undefined) [op, ex] = [ex, undefined]
    switch (op) {
      case 'sum':
      case 'prod':
      case 'min':
      case 'max':
      case 'sumfrac':
        if (x.length > 1) {
          const empty = arithmetic[op]([], ex)
          x = x.filter((x) => x.val !== empty)
        }
        if (x.length === 1) return wrap(x[0])
        return newMeta(x.length ? op : 'const', x)
      case 'const':
      case 'subscript':
        return newMeta('const', [])
      case 'vtag':
        info.usedCats = new Set([ex])
        return newMeta('const', [])
      case 'match':
      case 'thres':
      case 'lookup':
      case 'read':
        return wrap(x[0])
      case 'tag':
        return wrap(x[0], Object.keys(nTag!))
      case 'dtag':
        return wrap(x[0], ex)
      case 'custom':
        return newMeta(ex, x) // This is the only usage of `COp`
      default:
        assertUnreachable(op)
    }
  }
  override markGathered(
    _tag: Tag_,
    entryTag: Tag_,
    _n: AnyNode,
    result: CalcResult<string | number, CalcMeta<Tag_, COp>>
  ): CalcResult<string | number, CalcMeta<Tag_, COp>> {
    const { val } = result
    const meta = { ...result.meta }
    let dirty = false

    const newUsedCats = new Set([...meta.usedCats, ...Object.keys(entryTag)])
    if (meta.usedCats.size !== newUsedCats.size) {
      meta.usedCats = newUsedCats
      dirty = true
    }
    return dirty ? { val, meta: Object.freeze(meta) } : result
  }

  listFormulas(read: Read<Tag_>): Read<Tag_>[] {
    return this.gather(read.tag)
      .filter((x) => x.val)
      .map(
        ({ val, meta }) =>
          (reader as Read<Tag_>).withTag(meta.tag!)[val as Read['accu']]
      )
  }
  listCondFormulas(
    read: Read<Tag_>
  ): CondInfo<Member<Tag_> | 'All', Sheet<Tag_>> {
    return this.listFormulas(read)
      .map((x) => this.compute(x).meta.conds)
      .reduce(merge, {})
  }
}

function extractInfo<Tag_ extends Tag, COp>(
  x: CalcResult<any, CalcMeta<Tag_, COp>>[],
  br: CalcResult<any, CalcMeta<Tag_, COp>>[]
): Info<Tag_> {
  const metas = [...x.map((x) => x.meta), ...br.map((br) => br.meta)]
  let conds: Info<Tag_>['conds'] = {}
  let usedCats: Info<Tag_>['usedCats'] = new Set()
  for (const meta of metas) {
    conds = merge(conds, meta.conds)
    meta.usedCats.forEach((c) => usedCats.add(c))
  }
  const catLen = usedCats.size
  usedCats = metas.find((m) => m.usedCats.size === catLen)?.usedCats ?? usedCats
  return { usedCats, conds }
}
function merge<T extends object>(o: T, n: any): T {
  if (o === n) return o
  if (typeof o !== 'object') throw new Error(`cannot merge ${o} and ${n}`)
  if (Object.keys(n).length > Object.keys(o).length) [o, n] = [n, o] as any
  if (!Object.keys(n).length) return o

  let dirty = false
  const result = { ...(o as any) }
  for (const [k, v] of Object.entries(n)) {
    const oldV = result[k]
    const newV = k in result ? merge(oldV, v as any) : v
    if (oldV !== newV) {
      result[k] = newV
      dirty = true
    }
  }
  return Object.freeze(dirty ? result : o)
}
