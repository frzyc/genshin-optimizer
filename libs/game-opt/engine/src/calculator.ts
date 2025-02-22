import { assertUnreachable } from '@genshin-optimizer/common/util'
import type { AnyNode, CalcResult } from '@genshin-optimizer/pando/engine'
import {
  Calculator as BaseCalculator,
  calculation,
} from '@genshin-optimizer/pando/engine'
import type { Read, Tag } from './read'
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
  Src extends string | null,
  Dst extends string | null,
  Member extends string,
  Sheet extends string,
  Op = 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac'
> = PartialMeta<Src, Dst, Sheet, Op> & Info<Member, Sheet>
export type PartialMeta<
  Src extends string | null,
  Dst extends string | null,
  Sheet extends string,
  Op = 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac'
> = {
  tag?: Tag<Src, Dst, Sheet>
  op: Op
  ops: CalcResult<number, PartialMeta<Src, Dst, Sheet, Op>>[]
}
export type Info<Member extends string, Sheet extends string> = {
  conds: CondInfo<Member | 'All', Sheet>
}

const { arithmetic } = calculation

export class Calculator<
  Src extends string | null,
  Dst extends string | null,
  Member extends string,
  Sheet extends string,
  Op = 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac'
> extends BaseCalculator {
  override computeMeta(
    { op, ex }: AnyNode,
    val: number | string,
    _x: (
      | CalcResult<number | string, CalcMeta<Src, Dst, Member, Sheet, Op>>
      | undefined
    )[],
    _br: CalcResult<number | string, CalcMeta<Src, Dst, Member, Sheet, Op>>[],
    tag: Tag<Src, Dst, Sheet> | undefined
  ): CalcMeta<Src, Dst, Member, Sheet, Op> {
    const info = {
      ...Object.freeze({
        conds: Object.freeze({}),
      }),
    }
    const x = _x.filter((x) => !!x).map((x) => extract(x, info))
    _br.forEach((br) => extract(br, info))

    function withTag(
      tag: Tag<Src, Dst, Sheet> | undefined,
      meta: CalcMeta<Src, Dst, Member, Sheet, Op>
    ): CalcMeta<Src, Dst, Member, Sheet, Op> {
      return !meta.tag && tag ? { tag, ...meta } : meta
    }
    function finalize(
      op: CalcMeta<Src, Dst, Member, Sheet, Op>['op'],
      ops: CalcResult<number, PartialMeta<Src, Dst, Sheet, Op>>[]
    ): CalcMeta<Src, Dst, Member, Sheet, Op> {
      return withTag(tag, { op, ops, ...info })
    }
    function wrap(
      result: CalcResult<number | string, PartialMeta<Src, Dst, Sheet, Op>>
    ): CalcMeta<Src, Dst, Member, Sheet, Op> {
      const meta = result.meta as CalcMeta<Src, Dst, Member, Sheet, Op>
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
        let ops = x as CalcResult<number, PartialMeta<Src, Dst, Sheet, Op>>[]
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
        return finalize(
          ex,
          x as CalcResult<number, PartialMeta<Src, Dst, Sheet, Op>>[]
        )
      default:
        assertUnreachable(op)
    }
  }
  override markGathered(
    tag: Tag<Src, Dst, Sheet>,
    _n: AnyNode,
    result: CalcResult<string | number, CalcMeta<Src, Dst, Member, Sheet, Op>>
  ): CalcResult<string | number, CalcMeta<Src, Dst, Member, Sheet, Op>> {
    let dirty = false
    const val = result.val
    const meta = { ...Object.freeze(result.meta) }

    if (tag.qt === 'cond') {
      const { src, dst, sheet, q } = tag
      if (src && sheet && q)
        meta.conds = {
          [dst ?? 'All']: { [src]: { [sheet!]: { [q!]: val } } },
        } as CondInfo<Member | 'All', Sheet>
      dirty = true
    }
    Object.freeze(meta)
    return dirty ? { val, meta } : result
  }

  listFormulas(
    read: Read<Tag<Src, Dst, Sheet>, Src, Dst, Sheet>
  ): Read<Tag<Src, Dst, Sheet>, Src, Dst, Sheet>[] {
    return this.gather(read.tag)
      .filter((x) => x.val)
      .map(
        ({ val, meta }) =>
          reader.withTag(meta.tag!)[
            val as Read<Tag<Src, Dst, Sheet>, Src, Dst, Sheet>['accu']
          ]
      )
  }
  listCondFormulas(
    read: Read<Tag<Src, Dst, Sheet>, Src, Dst, Sheet>
  ): CondInfo<Member | 'All', Sheet> {
    return this.listFormulas(read)
      .map((x) => this.compute(x).meta.conds)
      .reduce(mergeConds, {})
  }
}

function extract<
  V,
  Src extends string | null,
  Dst extends string | null,
  Member extends string,
  Sheet extends string,
  Op = 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac'
>(
  x: CalcResult<V, CalcMeta<Src, Dst, Member, Sheet, Op>>,
  info: Info<Member, Sheet>
): CalcResult<V, PartialMeta<Src, Dst, Sheet, Op>> {
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
