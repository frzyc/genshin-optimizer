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
type MetaOp =
  | 'sum'
  | 'prod'
  | 'min'
  | 'max'
  | 'sumfrac'
  | 'const'
  | 'subscript'
  | 'vtag'
export type CalcMeta<Tag_ extends Tag, COp = never> = PartialMeta<Tag_, COp> &
  Info<Tag_>
export type PartialMeta<Tag_ extends Tag, Cop = never> = {
  tag?: Tag_
  op: MetaOp | Cop
  ops: CalcResult<number, PartialMeta<Tag_, Cop>>[]
}
export type Info<Tag_ extends Tag> = {
  conds: CondInfo<Member<Tag_> | 'All', Sheet<Tag_>>
}

const { arithmetic } = calculation

export class Calculator<
  Tag_ extends Tag = Tag,
  COp = never // values of supported `Custom['ex']` if any
> extends BaseCalculator<CalcMeta<Tag_, COp>> {
  override computeMeta(
    { op, ex }: AnyNode,
    val: number | string,
    _x: (CalcResult<number | string, CalcMeta<Tag_, COp>> | undefined)[],
    _br: CalcResult<number | string, CalcMeta<Tag_, COp>>[],
    tag: Tag_ | undefined
  ): CalcMeta<Tag_, COp> {
    const info = {
      ...Object.freeze({
        conds: Object.freeze({}),
      }),
    }
    const x = _x.filter((x) => !!x).map((x) => extract(x, info))
    _br.forEach((br) => extract(br, info))

    function withTag(
      tag: Tag_ | undefined,
      meta: CalcMeta<Tag_, COp>
    ): CalcMeta<Tag_, COp> {
      return !meta.tag && tag ? { tag, ...meta } : meta
    }
    function finalize(
      op: MetaOp | COp,
      ops: CalcResult<number, PartialMeta<Tag_, COp>>[]
    ): CalcMeta<Tag_, COp> {
      return withTag(tag, { op, ops, ...info })
    }
    function wrap(
      result: CalcResult<number | string, PartialMeta<Tag_, COp>>
    ): CalcMeta<Tag_, COp> {
      const meta = result.meta as CalcMeta<Tag_, COp>
      const reuse = meta.conds === info.conds
      return withTag(tag, reuse ? meta : { ...meta, ...info })
    }

    if (op === 'read' && ex !== undefined) {
      if (ex === 'min' || ex === 'max')
        return wrap(x.find((x) => x!.val === val)!)
      op = ex
      ex = undefined
    }
    switch (op) {
      case 'sum':
      case 'prod':
      case 'min':
      case 'max':
      case 'sumfrac': {
        let ops = x as CalcResult<number, PartialMeta<Tag_, COp>>[]
        if (ops.length > 1) {
          const empty = arithmetic[op]([], ex)
          ops = ops.filter((x) => x!.val !== empty)
        }
        if (ops.length === 1) return wrap(ops[0])
        if (ops.length === 0) return finalize('const', [])
        return finalize(op, ops)
      }
      case 'const':
      case 'vtag':
      case 'subscript':
        return finalize('const', [])
      case 'match':
      case 'thres':
      case 'lookup':
      case 'tag':
      case 'dtag':
        return wrap(x[0])
      case 'read':
        return Object.freeze(wrap(x[0]))
      case 'custom':
        // This is the only usage of `COp`
        return finalize(ex, x as CalcResult<number, PartialMeta<Tag_, COp>>[])
      default:
        assertUnreachable(op)
    }
  }
  override markGathered(
    tag: Tag_,
    _n: AnyNode,
    result: CalcResult<string | number, CalcMeta<Tag_, COp>>
  ): CalcResult<string | number, CalcMeta<Tag_, COp>> {
    let dirty = false
    const val = result.val
    const meta = { ...Object.freeze(result.meta) }

    if (tag.qt === 'cond') {
      const { src, dst, sheet, q } = tag
      if (src && sheet && q)
        meta.conds = {
          [dst ?? 'All']: { [src]: { [sheet!]: { [q!]: val } } },
        } as CondInfo<Member<Tag_> | 'All', Sheet<Tag_>>
      dirty = true
    }
    Object.freeze(meta)
    return dirty ? { val, meta } : result
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
      .reduce(mergeConds, {})
  }
}

function extract<V, Tag_ extends Tag, COp>(
  x: CalcResult<V, CalcMeta<Tag_, COp>>,
  info: Info<Tag_>
): CalcResult<V, PartialMeta<Tag_, COp>> {
  const { conds, ...meta } = x.meta
  info.conds = mergeConds(info.conds, conds)
  return Object.isFrozen(x.meta) ? x : { val: x.val, meta }
}

function mergeConds<Member extends string, Sheet extends string>(
  a: CondInfo<Member | 'All', Sheet>,
  b: CondInfo<Member | 'All', Sheet>
): CondInfo<Member | 'All', Sheet> {
  return merge(a, b, (_, v) => (typeof v === 'number' ? v : undefined))
}
function merge<T extends Record<string, any>>(
  a: T,
  b: T,
  leaf: (a: any, b: any) => any
): T {
  const l = leaf(a, b)
  if (l !== undefined) return l
  if (Object.keys(a).length < Object.keys(b).length) [a, b] = [b, a]
  if (!Object.keys(b).length) return a

  let dirty = false
  const result: any = { ...a }
  for (const [k, v] of Object.entries(b)) {
    const oldV = result[k]
    const newV = k in result ? merge(oldV, v, leaf) : v
    if (oldV !== newV) {
      result[k] = newV
      dirty = true
    }
  }
  return dirty ? result : a
}
