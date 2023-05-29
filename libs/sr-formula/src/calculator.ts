import type { AnyOP, CalcResult } from '@genshin-optimizer/waverider'
import { calculation, Calculator as Base } from '@genshin-optimizer/waverider'
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
    op: Exclude<AnyOP, 'read'>,
    tag: Tag | undefined,
    val: any,
    x: (CalcResult<any, Output> | undefined)[],
    _br: CalcResult<any, Output>[],
    ex: any
  ): Output {
    function constOverride(): Output {
      return { tag, op: 'const', ops: [], conds: [] }
    }
    const preConds = [
      // TODO: include [tag] if it is marked as conditional. It is `tag.qt === 'cond'` in `formula`
      ...[...x, ..._br].map((x) => x?.meta.conds!),
    ].filter((x) => x && x.length)
    const conds = preConds.length <= 1 ? preConds[0] ?? [] : preConds.flat()

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
      case 'subscript':
        return constOverride()
      case 'match':
      case 'thres':
      case 'lookup':
        return { ...x.find((x) => x)!.meta, conds }
      case 'tag':
      case 'dtag': {
        const { tag: baseTag, op, ops } = x[0]!.meta
        return { tag: baseTag ?? tag, op, ops, conds }
      }
      default:
        throw new Error('Should not reach this point')
    }
  }
}
