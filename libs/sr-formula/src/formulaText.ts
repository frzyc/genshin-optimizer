import type { CalcResult } from '@genshin-optimizer/pando'
import type { Tag } from './data/util'

type Output = {
  tag: Tag | undefined
  op: 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac'
  ops: CalcResult<number, Output>[]
}

type FormulaText = {
  name: string | undefined
  formula: string
  src: string | undefined
  prec: number

  deps: FormulaText[]
}
export function translate(
  data: CalcResult<number, Output>,
  cache: Map<CalcResult<number, Output>, FormulaText> = new Map()
): FormulaText {
  const old = cache.get(data)
  if (old) return old
  const {
    val,
    meta: { tag, op, ops },
  } = data

  const deps = new Set<FormulaText>()
  function getString(
    ops: CalcResult<number, Output>[],
    prec: number
  ): string[] {
    return ops.map((op) => {
      const text = translate(op, cache)
      if (text.name) return deps.add(text), text.name
      text.deps.forEach((dep) => deps.add(dep))
      return text.prec >= prec ? text.formula : `(${text.formula})`
    })
  }

  let formula: string, prec: number
  switch (op) {
    case 'const':
      formula = `${val}` // TODO: Add % here if `tag` indicates percent constant
      prec = Infinity
      break
    case 'sum':
    case 'prod':
    case 'max':
    case 'min':
      {
        const { head, joiner, end } = details[op]
        prec = details[op].prec
        formula = head + getString(ops, prec).join(joiner) + end
      }
      break
    case 'sumfrac': {
      const [dem] = getString(ops, 2)
      const [num1, num2] = getString(ops, 1)

      formula = `${dem} / (${num1} + ${num2})`
      prec = details.prod.prec
    }
  }
  let name: string | undefined, src: string | undefined
  if (tag) {
    // TODO: Compute from tag
    name = `Untitled ${val}`
    src = undefined
  }

  const result: FormulaText = {
    name,
    formula,
    prec,
    src,
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
