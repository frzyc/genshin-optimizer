import { assertUnreachable } from '@genshin-optimizer/common/util'
import type {
  AnyNode,
  Tag as BaseTag,
  CalcResult,
} from '@genshin-optimizer/pando/engine'
import {
  Calculator as BaseCalculator,
  calculation,
} from '@genshin-optimizer/pando/engine'
import type { AnyTag, Read } from './read'
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

export type CalcMeta<
  Tag extends AnyTag,
  Op = 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac'
> = PartialMeta<Tag, Op> &
  Info<NonNullable<Tag['member']>, NonNullable<Tag['sheet']>>
export type PartialMeta<
  Tag extends BaseTag,
  Op = 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac'
> = {
  tag?: Tag
  op: Op
  ops: CalcResult<number, PartialMeta<Tag, Op>>[]
}
export type Info<Member extends string, Sheet extends string> = {
  conds: CondInfo<Member | 'All', Sheet>
}

const { arithmetic } = calculation

export class Calculator<
  Tag extends AnyTag = AnyTag,
  Op = 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac'
> extends BaseCalculator {
  override computeMeta(
    { op, ex }: AnyNode,
    val: number | string,
    _x: (CalcResult<number | string, CalcMeta<Tag, Op>> | undefined)[],
    _br: CalcResult<number | string, CalcMeta<Tag, Op>>[],
    tag: Tag | undefined
  ): CalcMeta<Tag, Op> {
    const info = {
      ...Object.freeze({
        conds: Object.freeze({}),
      }),
    }
    const x = _x.filter((x) => !!x).map((x) => extract(x, info))
    _br.forEach((br) => extract(br, info))

    function withTag(
      tag: Tag | undefined,
      meta: CalcMeta<Tag, Op>
    ): CalcMeta<Tag, Op> {
      return !meta.tag && tag ? { tag, ...meta } : meta
    }
    function finalize(
      op: CalcMeta<Tag, Op>['op'],
      ops: CalcResult<number, PartialMeta<Tag, Op>>[]
    ): CalcMeta<Tag, Op> {
      return withTag(tag, { op, ops, ...info })
    }
    function wrap(
      result: CalcResult<number | string, PartialMeta<Tag, Op>>
    ): CalcMeta<Tag, Op> {
      const meta = result.meta as CalcMeta<Tag, Op>
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
        let ops = x as CalcResult<number, PartialMeta<Tag, Op>>[]
        if (ops.length > 1) {
          const empty = arithmetic[op]([], ex)
          ops = ops.filter((x) => x!.val !== empty)
        }
        if (ops.length === 1) return wrap(ops[0])
        if (ops.length === 0) return finalize('const' as Op, [])
        return finalize(op as Op, ops)
      }
      case 'const':
      case 'vtag':
      case 'subscript':
        return finalize('const' as Op, [])
      case 'match':
      case 'thres':
      case 'lookup':
      case 'tag':
      case 'dtag':
        return wrap(x[0])
      case 'read':
        return Object.freeze(wrap(x[0]))
      case 'custom':
        return finalize(ex, x as CalcResult<number, PartialMeta<Tag, Op>>[])
      default:
        assertUnreachable(op)
    }
  }
  override markGathered(
    tag: Tag,
    _n: AnyNode,
    result: CalcResult<string | number, CalcMeta<Tag, Op>>
  ): CalcResult<string | number, CalcMeta<Tag, Op>> {
    let dirty = false
    const val = result.val
    const meta = { ...Object.freeze(result.meta) }

    if (tag.qt === 'cond') {
      const { src, dst, sheet, q } = tag
      if (src && sheet && q)
        meta.conds = {
          [dst ?? 'All']: { [src]: { [sheet!]: { [q!]: val } } },
        } as CondInfo<
          NonNullable<Tag['member']> | 'All',
          NonNullable<Tag['sheet']>
        >
      dirty = true
    }
    Object.freeze(meta)
    return dirty ? { val, meta } : result
  }

  listFormulas(read: Read<Tag>): Read<Tag>[] {
    return this.gather(read.tag)
      .filter((x) => x.val)
      .map(
        ({ val, meta }) =>
          (reader as Read<Tag>).withTag(meta.tag!)[val as Read<Tag>['accu']]
      )
  }
  listCondFormulas(
    read: Read<Tag>
  ): CondInfo<NonNullable<Tag['member']> | 'All', NonNullable<Tag['sheet']>> {
    return this.listFormulas(read)
      .map((x) => this.compute(x).meta.conds)
      .reduce(mergeConds, {})
  }
}

function extract<
  V,
  Tag extends AnyTag,
  Op = 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac'
>(
  x: CalcResult<V, CalcMeta<Tag, Op>>,
  info: Info<NonNullable<Tag['member']>, NonNullable<Tag['sheet']>>
): CalcResult<V, PartialMeta<Tag, Op>> {
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
