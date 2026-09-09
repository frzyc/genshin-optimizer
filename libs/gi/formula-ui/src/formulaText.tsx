import {
  assertUnreachable,
  getUnitStr,
  objFilter,
  valueString,
} from '@genshin-optimizer/common/util'
import type { CalcMeta } from '@genshin-optimizer/game-opt/engine'
import type { FormulaText } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CalcResult } from '@genshin-optimizer/pando/engine'
import type { Tag } from '@genshin-optimizer/gi/formula'
import { Fragment, type ReactNode } from 'react'
import { TagDisplay } from './components/TagDisplay'
import { getTagLabel } from './util'

type Output = CalcMeta<Tag, 'res'>

/** Structural dmg products; inline so DEF/RES/Base DMG show as named deps. */
function formulaDisplayTag(
  tag: Tag | undefined,
  usedCats: Set<keyof Tag>,
  inheritedEle?: Tag['ele']
): Tag | undefined {
  if (!tag?.q || tag.q === '_') return undefined
  if (tag.qt === 'dmg' && (tag.q === 'inDmg' || tag.q === 'out'))
    return undefined
  const usedTag = objFilter(tag, (_, k) => usedCats.has(k as keyof Tag)) as Tag
  const base = usedTag.q ? usedTag : tag
  // Hit `ele` is only a RES label; do not stamp it onto ATK/DEF.
  const ele =
    tag.q === 'postRes' || tag.q === 'preRes'
      ? (tag.ele ?? inheritedEle)
      : tag.ele
  const withEle = ele && !base.ele ? { ...base, ele } : base
  if (withEle.qt === 'formula') return withEle
  const { name: _name, move: _move, ...rest } = withEle
  return rest
}

export function formulaText(
  data: CalcResult<number, Output>,
  cache: Map<CalcResult<number, Output>, FormulaText> = new Map(),
  inheritedEle?: Tag['ele']
): FormulaText {
  const old = cache.get(data)
  if (old) return old
  const {
    val,
    meta: { tag, op, ops, usedCats },
  } = data
  const displayTag = formulaDisplayTag(tag, usedCats, inheritedEle)
  const displayVal = valueString(
    val,
    getUnitStr(tag?.q === '_' ? '_' : getTagLabel(displayTag ?? tag))
  )
  const childEle = displayTag?.ele ?? tag?.ele ?? inheritedEle

  const deps = new Set<FormulaText>()
  function getString(
    childOps: CalcResult<number, Output>[],
    prec: number
  ): ReactNode[] {
    return childOps.map((child, i) => {
      const text = formulaText(child, cache, childEle)
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

  let formula: ReactNode
  let prec = Number.POSITIVE_INFINITY
  switch (op) {
    case 'const':
      formula = displayVal
      prec = Number.POSITIVE_INFINITY
      break
    case 'sum':
    case 'prod':
    case 'max':
    case 'min': {
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
      break
    }
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
    case 'res': {
      const [preRes] = ops
      if (preRes.val >= 0.75) {
        formula = <span>1 / (1 + 4 * {getString(ops, details.prod.prec)})</span>
        prec = details.prod.prec
      } else if (preRes.val >= 0) {
        formula = <span>1 - {getString(ops, details.sum.prec)}</span>
        prec = details.sum.prec
      } else {
        formula = <span>1 - {getString(ops, details.prod.prec)} / 2</span>
        prec = details.sum.prec
      }
      break
    }
    default:
      assertUnreachable(op)
  }
  let name: ReactNode
  let sheet: string | undefined
  // `percent()` tags `{ qt: 'misc', q: '_' }`; `dmg.out` / `dmg.inDmg` inline.
  if (displayTag) {
    name = (
      <span>
        <TagDisplay tag={displayTag} /> {displayVal}
      </span>
    )
    sheet = displayTag.sheet ?? tag?.sheet ?? undefined
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
  max: { head: 'Max(', joiner: ', ', end: ')', prec: Number.POSITIVE_INFINITY },
  min: { head: 'Min(', joiner: ', ', end: ')', prec: Number.POSITIVE_INFINITY },
} as const
