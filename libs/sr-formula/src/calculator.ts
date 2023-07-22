import type { AnyNode, CalcResult } from '@genshin-optimizer/pando'
import { Calculator as Base, calculation } from '@genshin-optimizer/pando'
import { assertUnreachable } from '@genshin-optimizer/util'
import type { Tag } from './data/util'

const { arithmetic } = calculation

type Output = {
  tag: Tag | undefined
  op: 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac'
  ops: CalcResult<number, Output>[]
  conds: Tag[]
}

export class Calculator extends Base<Output> {
  override computeMeta(
    { op, ex }: AnyNode,
    val: number | string,
    x: (CalcResult<number | string, Output> | undefined)[],
    _br: CalcResult<number | string, Output>[],
    tag: Tag | undefined
  ): Output {
    function constOverride(): Output {
      return { tag, op: 'const', ops: [], conds: [] }
    }
    const preConds = [
      // TODO: include [tag] if it is marked as conditional. It is `tag.qt === 'cond'` in `formula`
      ...[...x, ..._br].map((x) => x?.meta.conds as Tag[]),
    ].filter((x) => x && x.length)
    const conds = preConds.length <= 1 ? preConds[0] ?? [] : preConds.flat()

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
          Output
        >[]
        if (ops.length <= 1) return ops[0]?.meta ?? constOverride()
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
      default:
        if (op === 'custom') throw new Error(`Unsupported operation ${ex}`)
        assertUnreachable(op)
    }
  }
}
