import type { CalcResult } from '@genshin-optimizer/pando/engine'
import type { CalcMeta } from './calculator'

type Output = CalcMeta
type FormulaText = {
  name: string | undefined
  formula: string
  sheet: string | undefined
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
    prec: number // precedence of the encompassing/parent term
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
      formula = tag?.q?.endsWith('_') ? `${(val * 100).toFixed(2)}%` : `${val}`
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
      const [dem] = getString(ops, details.prod.prec)
      const [num1, num2] = getString(ops, details.sum.prec)

      formula = `${dem} / (${num1} + ${num2})`
      prec = details.prod.prec
      break
    }
    case 'res': {
      const [preRes] = ops
      if (preRes.val >= 0.75) {
        formula = `1 / (1 + 4 * ${getString(ops, details.prod.prec)})`
        prec = details.prod.prec
      } else if (preRes.val >= 0) {
        formula = `1 - ${getString(ops, details.sum.prec)}`
        prec = details.sum.prec
      } else {
        formula = `1 - ${getString(ops, details.prod.prec)} / 2`
        prec = details.sum.prec
      }
      break
    }
    default:
      throw new Error('Unreachable')
  }
  let name: string | undefined, sheet: string | undefined
  if (tag) {
    const { qt, q, src, dst, et, sheet: s, ...remaining } = tag
    const mem = (src ? ' m' + src : '') + (dst ? ' => m' + dst : '')

    // TODO: Compute name, unit, source, etc.
    name = `(${et}${mem}) ${qt}.${q} ${Object.entries(remaining)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}:${v}`)
      .join(' ')} ${val}`
    sheet = s ?? undefined
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
