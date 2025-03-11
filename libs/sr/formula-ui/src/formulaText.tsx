import {
  assertUnreachable,
  getUnitStr,
  objFilter,
  valueString,
} from '@genshin-optimizer/common/util'
import type { CalcMeta } from '@genshin-optimizer/game-opt/engine'
import type { CalcResult } from '@genshin-optimizer/pando/engine'
import type { Tag } from '@genshin-optimizer/sr/formula'
import { Fragment, type ReactNode } from 'react'
import { TagDisplay } from './components'

type Output = CalcMeta<Tag, 'floor'>

type FormulaText = {
  name: ReactNode | undefined
  formula: ReactNode
  sheet: string | undefined
  prec: number

  deps: FormulaText[]
}
export function formulaText(
  data: CalcResult<number, Output>,
  cache: Map<CalcResult<number, Output>, FormulaText> = new Map()
): FormulaText {
  const old = cache.get(data)
  if (old) return old
  const {
    val,
    meta: { tag, op, ops, usedCats },
  } = data
  const usedTag =
    tag && (objFilter(tag, (_, k) => usedCats.has(k as keyof Tag)) as Tag)
  const displayVal = valueString(val, getUnitStr(usedTag?.name ?? tag?.q ?? ''))

  const deps = new Set<FormulaText>()
  function getString(
    ops: CalcResult<number, Output>[],
    prec: number
  ): ReactNode[] {
    return ops.map((op, i) => {
      const text = formulaText(op, cache)
      if (text.name) {
        deps.add(text)
        return text.name
      }
      text.deps.forEach((dep) => deps.add(dep))
      return text.prec >= prec ? (
        text.formula
      ) : (
        <span key={i}>({text.formula})</span>
      )
    })
  }

  let formula: ReactNode,
    prec = Infinity
  switch (op) {
    case 'const':
      formula = displayVal
      prec = Infinity
      break
    case 'sum':
    case 'prod':
    case 'max':
    case 'min':
      {
        const { head, joiner, end } = details[op]
        prec = details[op].prec
        formula = (
          <span>
            {head}
            {getString(ops, prec).map((x, i) => (
              <Fragment key={i}>
                {x}
                {i < ops.length - 1 && joiner}
              </Fragment>
            ))}
            {end}
          </span>
        )
      }
      break
    case 'sumfrac': {
      const [dem] = getString(ops, 2)
      const [num1, num2] = getString(ops, 1)

      formula = (
        <span>
          {dem} / ({num1} + {num2})
        </span>
      )
      prec = details.prod.prec
      break
    }
    case 'floor':
      formula = `\u230A${ops[0].val}\u230B`
      prec = Infinity
      break
    default:
      assertUnreachable(op)
  }
  let name: ReactNode, sheet: string | undefined
  if (usedTag) {
    name = (
      <span>
        <TagDisplay tag={usedTag} /> {displayVal}
      </span>
    )
    sheet = undefined
  }

  const result: FormulaText = {
    name,
    formula,
    prec,
    sheet,
    deps: [...new Set(deps)],
  }
  cache.set(data, result)
  return result
}

const details = {
  sum: { head: '', joiner: ' + ', end: '', prec: 1 },
  prod: { head: '', joiner: ' * ', end: '', prec: 2 },
  max: { head: 'Max(', joiner: ', ', end: ')', prec: Infinity },
  min: { head: 'Min(', joiner: ', ', end: ')', prec: Infinity },
} as const
