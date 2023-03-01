import { AnyOP, CalcResult, calculation, Calculator as Base } from '@genshin-optimizer/waverider'
import { preps, self, Tag } from './data/util'

const { arithmetic } = calculation

type Output = {
  tag: Tag | undefined
  op: 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac'
  ops: CalcResult<number, Output>[]
  conds: Tag[]
}

export class Calculator extends Base<Output> {
  override computeMeta(op: Exclude<AnyOP, 'read'>, tag: Tag | undefined, val: any, x: (CalcResult<any, Output> | undefined)[], _br: CalcResult<any, Output>[], ex: any): Output {
    function constOverride(): Output {
      return { tag, op: 'const', ops: [], conds: [] }
    }
    const conds = [...x.flatMap(x => x?.meta.conds ?? []), ..._br.flatMap(br => br.meta.conds)]
    if (tag?.qt === 'cond') conds.push(tag)

    switch (op) {
      case 'sum': case 'prod': case 'min': case 'max': case 'sumfrac': {
        const empty = arithmetic[op]([], ex)
        const ops = x.filter(x => x!.val !== empty) as CalcResult<number, Output>[]
        if (ops.length <= 1) return ops[0]?.meta ?? constOverride()
        if (op === 'prod' && val === 0) return constOverride()
        return { tag, op, ops, conds }
      }

      case 'const': case 'subscript': return constOverride()
      case 'match': case 'thres': case 'lookup': return { ...x.find(x => x)!.meta, conds }
      case 'tag': case 'dtag': {
        const { tag: baseTag, op, ops } = x[0]!.meta
        return { tag: baseTag ?? tag, op, ops, conds }
      }
      default: throw new Error('Should not reach this point')
    }
  }

  listFormulas(tag: Omit<Tag, 'qt' | 'q'>): Tag[] {
    return this.get(self.formula.listing.withTag(tag).tag).map(listing => {
      const { val: prep, meta: { tag: { ...tag } } } = listing
      // Clone and convert `formulaTag` to appropriate shape
      delete tag.qt, tag.q
      tag.et = 'prep'
      tag.prep = prep as typeof preps[number]
      return tag
    }).filter(x => x.prep)
  }
}
