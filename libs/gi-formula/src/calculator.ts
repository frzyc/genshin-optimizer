import type { AnyNode, CalcResult } from '@genshin-optimizer/pando'
import { Calculator as Base, calculation } from '@genshin-optimizer/pando'
import { assertUnreachable } from '@genshin-optimizer/util'
import type { Read, Tag } from './data/util'
import { reader } from './data/util'

const { arithmetic } = calculation

export type CalcMeta = {
  tag: Tag | undefined
  op: 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac' | 'res'
  ops: CalcResult<number, CalcMeta>[]
  conds: Tag[]
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
    const preConds = [
      tag?.qt === 'cond' ? [tag] : [],
      ...[...x, ..._br].map((x) => x?.meta.conds as Tag[]),
    ].filter((x) => x && x.length)
    const conds = preConds.length <= 1 ? preConds[0] ?? [] : preConds.flat()

    function constOverride(): CalcMeta {
      return { tag, op: 'const', ops: [], conds }
    }

    if (op === 'read' && ex !== undefined) {
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
}
export function res(x: number): number {
  if (x >= 0.75) return 1 / (1 + 4 * x)
  if (x >= 0) return 1 - x
  return 1 - 0.5 * x
}
