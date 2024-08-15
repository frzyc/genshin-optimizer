import { assertUnreachable } from '@genshin-optimizer/common/util'
import type { AnyNode, CalcResult } from '@genshin-optimizer/pando/engine'
import {
  Calculator as Base,
  DebugCalculator,
  calculation,
} from '@genshin-optimizer/pando/engine'
import type { Member, Read, Sheet, Tag } from './data/util'
import { reader, tagStr } from './data/util'

const { arithmetic } = calculation
const emptyCond: CondInfo = {}

type CondInfo = Partial<
  Record<
    Member,
    Partial<Record<Member, Partial<Record<Sheet, Record<string, number>>>>>
  >
>
export type CalcMeta = {
  tag: Tag | undefined
  op: 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac' | 'res'
  ops: CalcResult<number, CalcMeta>[]
  /// conds[dst][src][sheet][name]
  conds: CondInfo
}

export class Calculator extends Base<CalcMeta> {
  override computeCustom(val: any[], op: string): any {
    if (op == 'res') return res(val[0])
    return super.computeCustom(val, op)
  }
  override computeMeta(
    { op, ex }: AnyNode,
    val: number | string,
    x: (CalcResult<number | string, CalcMeta> | undefined)[],
    _br: CalcResult<number | string, CalcMeta>[],
    tag: Tag | undefined
  ): CalcMeta {
    let conds = emptyCond
    for (const v of [...x, ..._br]) {
      if (!v) continue
      conds = merge(conds, v.meta.conds)
    }
    if (tag?.qt === 'cond') {
      const { src, dst, sheet, q } = tag
      conds = merge(conds, {
        [dst ?? null!]: { [src ?? null!]: { [sheet!]: { [q!]: val } } },
      })
    }

    function constOverride(): CalcMeta {
      return { tag, op: 'const', ops: [], conds }
    }

    if (op === 'read' && ex !== undefined) {
      if (ex === 'min' || ex === 'max')
        return { ...x.find((x) => x!.val === val)!.meta, conds }
      op = ex
      ex = undefined
    }
    switch (op) {
      case 'sum':
      case 'prod':
      case 'min':
      case 'max':
      case 'sumfrac': {
        let ops = x as CalcResult<number, CalcMeta>[]
        if (ops.length > 1) {
          const empty = arithmetic[op]([], ex)
          ops = ops.filter((x) => x!.val !== empty)
        }
        if (ops.length <= 1) {
          let meta = ops[0]?.meta ?? constOverride()
          if (meta.conds !== conds) meta = { ...meta, conds } // Use parent `conds` when short-circuiting
          if (!meta.tag && tag) meta = { ...meta, tag }
          return meta
        }
        if (op === 'prod' && val === 0) return constOverride()
        return { tag, op, ops, conds }
      }

      case 'const':
      case 'vtag':
      case 'subscript':
        return constOverride()
      case 'match':
      case 'thres':
      case 'lookup':
        return { ...x.find((x) => x)!.meta, conds }
      case 'tag':
      case 'read':
      case 'dtag': {
        const { tag: baseTag, op, ops } = x[0]!.meta
        return { tag: baseTag ?? tag, op, ops, conds }
      }
      case 'custom':
        if (ex == 'res') {
          const ops = x as [CalcResult<number, CalcMeta>]
          return { tag, op: ex, ops, conds }
        }
        return constOverride()
      default:
        assertUnreachable(op)
    }
  }

  listFormulas(read: Read): Read[] {
    return this.get(read.tag)
      .filter((x) => x.val)
      .map(({ val, meta }) => reader.withTag(meta.tag!)[val as Read['accu']])
  }
  listCondFormulas(read: Read): CondInfo {
    return this.listFormulas(read)
      .map((x) => this.compute(x).meta.conds)
      .reduce(merge, emptyCond)
  }
  toDebug(): DebugCalculator {
    return new DebugCalculator(this, tagStr)
  }
}
export function res(x: number): number {
  if (x >= 0.75) return 1 / (1 + 4 * x)
  if (x >= 0) return 1 - x
  return 1 - 0.5 * x
}

function merge<T extends Record<string, any>>(a: T, b: T): T {
  if (Object.keys(a).length < Object.keys(b).length) [a, b] = [b, a]
  if (Object.keys(b).length === 0) return a

  let dirty = false
  const result: any = { ...a }
  for (const [key, val] of Object.entries(b)) {
    if (result[key] === val) continue
    if (result[key]) {
      const new_val = merge(result[key], val)
      if (new_val !== result[key]) {
        dirty = true
        result[key] = new_val
      }
    } else {
      dirty = true
      result[key] = val
    }
  }

  return dirty ? result : a
}
