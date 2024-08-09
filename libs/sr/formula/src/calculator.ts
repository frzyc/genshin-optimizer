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
  op: 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac'
  ops: CalcResult<number, CalcMeta>[]
  /// conds[dst][src][sheet][name]
  conds: CondInfo
}

export class Calculator extends Base<CalcMeta> {
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
        [dst!]: { [src!]: { [sheet!]: { [q!]: val } } },
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
        const empty = arithmetic[op]([], ex)
        const ops = x.filter((x) => x!.val !== empty) as CalcResult<
          number,
          CalcMeta
        >[]
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
        throw new Error(`Unsupported operation ${ex}`)
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
        result[key] = val
      }
    } else {
      dirty = true
      result[key] = val
    }
  }

  return dirty ? result : a
}
