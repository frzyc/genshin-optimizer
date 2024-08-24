import { assertUnreachable } from '@genshin-optimizer/common/util'
import type { AnyNode, CalcResult } from '@genshin-optimizer/pando/engine'
import {
  Calculator as Base,
  DebugCalculator,
  calculation,
} from '@genshin-optimizer/pando/engine'
import type { Member, Read, Sheet, Tag } from './data/util'
import { reader, tagStr } from './data/util'

const emptyInfo: Info = Object.freeze({ conds: Object.freeze({}) })
const { arithmetic } = calculation

type MemRec<V> = Partial<Record<Member | 'all', V>>
type SingleCondInfo = Partial<Record<Sheet, Record<string, string | number>>>
export type SrcCondInfo = MemRec<SingleCondInfo>
/// conds[dst][src][sheet][name]
type CondInfo = MemRec<SrcCondInfo>

export type CalcMeta = PartialMeta & Info
export type PartialMeta = {
  tag?: Tag
  op: 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac' | 'res'
  ops: CalcResult<number, PartialMeta>[]
}
type Info = { conds: CondInfo }

export class Calculator extends Base<CalcMeta> {
  override computeMeta(
    { op, ex }: AnyNode,
    val: number | string,
    _x: (CalcResult<number | string, CalcMeta> | undefined)[],
    _br: CalcResult<number | string, CalcMeta>[],
    tag: Tag | undefined
  ): CalcMeta {
    const info = { ...emptyInfo }
    const x = _x.filter((x) => !!x).map((x) => extract(x, info))
    _br.forEach((br) => extract(br, info))

    function withTag(tag: Tag | undefined, meta: CalcMeta): CalcMeta {
      return !meta.tag && tag ? { tag, ...meta } : meta
    }
    function finalize(
      op: CalcMeta['op'],
      ops: CalcResult<number, PartialMeta>[]
    ): CalcMeta {
      return withTag(tag, { op, ops, ...info })
    }
    function wrap(result: CalcResult<number | string, PartialMeta>): CalcMeta {
      const meta = result.meta as CalcMeta
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
        let ops = x as CalcResult<number, PartialMeta>[]
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
        return finalize(ex, x as CalcResult<number, PartialMeta>[])
      default:
        assertUnreachable(op)
    }
  }
  override markGathered(
    tag: Tag,
    _n: AnyNode,
    result: CalcResult<string | number, CalcMeta>
  ): CalcResult<string | number, CalcMeta> {
    let dirty = false
    const val = result.val
    const meta = { ...Object.freeze(result.meta) }

    if (tag.qt === 'cond') {
      const { src, dst, sheet, q } = tag
      meta.conds = {
        [dst ?? 'all']: { [src ?? 'all']: { [sheet!]: { [q!]: val } } },
      }
      dirty = true
    }
    Object.freeze(meta)
    return dirty ? { val, meta } : result
  }

  listFormulas(read: Read): Read[] {
    return this.gather(read.tag)
      .filter((x) => x.val)
      .map(({ val, meta }) => reader.withTag(meta.tag!)[val as Read['accu']])
  }
  listCondFormulas(read: Read): CondInfo {
    return this.listFormulas(read)
      .map((x) => this.compute(x).meta.conds)
      .reduce(mergeConds, {})
  }
  toDebug(): DebugCalculator {
    return new DebugCalculator(this, tagStr)
  }
}

function extract<V>(
  x: CalcResult<V, CalcMeta>,
  info: Info
): CalcResult<V, PartialMeta> {
  const { conds, ...meta } = x.meta
  info.conds = mergeConds(info.conds, conds)
  return Object.isFrozen(x.meta) ? x : { val: x.val, meta }
}

function mergeConds(a: CondInfo, b: CondInfo): CondInfo {
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
