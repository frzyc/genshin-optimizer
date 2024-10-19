import { ColorText } from '@genshin-optimizer/common/ui'
import { valueString } from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  CharacterSheetKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSetKeys,
  allCharacterSheetKeys,
  allWeaponKeys,
} from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/i18n'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import type { Info, InfoExtra, KeyMapPrefix } from '@genshin-optimizer/gi/wr'
import { useContext, type ReactNode } from 'react'
import { SillyContext } from '../context'
import { resolveInfo } from './resolveInfo'

type CalcDisplay = {
  name?: ReactNode
  valueString: string

  prec: number
  formula: ReactNode
  assignment?: ReactNode
  formulas: ReactNode[]
}

const subKeyMap: Record<KeyMapPrefix, string> = {
  default: 'Default',
  base: 'Base',
  total: 'Total',
  uncapped: 'Uncapped',
  custom: 'Custom',
  char: 'Char.',
  art: 'Art.',
  weapon: 'Weapon',
  teamBuff: 'Team',
}

const displayKey = Symbol()

function SourceDisplay({ source }: { source: string | undefined }) {
  const { silly } = useContext(SillyContext)
  if (!source) return null
  if (allArtifactSetKeys.includes(source as ArtifactSetKey))
    return (
      <ColorText color="secondary">
        {' '}
        (<Translate ns="artifactNames_gen" key18={source} />)
      </ColorText>
    )
  if (allWeaponKeys.includes(source as WeaponKey))
    return (
      <ColorText color="secondary">
        {' '}
        (<Translate ns="weaponNames_gen" key18={source} />)
      </ColorText>
    )
  if (allCharacterSheetKeys.includes(source as CharacterSheetKey))
    return (
      <ColorText color="secondary">
        {' '}
        (
        <Translate
          ns={silly ? 'sillyWisher_charNames' : 'charNames_gen'}
          key18={source}
        />
        )
      </ColorText>
    )
  return null
}

export function GetCalcDisplay(
  node: CalcResult<number | string | undefined>
): CalcDisplay {
  if ((node as any)[displayKey]) {
    return (node as any)[displayKey]
  }
  const result: CalcDisplay = _getCalcDisplay(node)
  ;(node as any)[displayKey] = result
  return result
}
function _getCalcDisplay(
  node: CalcResult<number | string | undefined>
): CalcDisplay {
  const { info, value } = node
  if (typeof value !== 'number') {
    const str = value ?? ''
    return {
      prec: Infinity,
      valueString: str,
      formula: str,
      formulas: [],
    }
  }

  const infoExtra = resolveInfo(info)
  const { name, prefix, source, variant } = infoExtra
  const result = computeFormulaDisplay(node as CalcResult<number>, infoExtra)
  if (node.info.path) {
    const prefixDisplay = prefix && !source ? <>{subKeyMap[prefix]} </> : null
    const sourceDisplay = <SourceDisplay source={source} />
    const nameVariant = variant && variant === 'invalid' ? undefined : variant
    result.name = (
      <>
        <ColorText color={nameVariant}>
          {prefixDisplay}
          {prefixDisplay && ' '}
          {name}
        </ColorText>{' '}
        {sourceDisplay}
      </>
    )

    if (node.meta.op !== 'const')
      result.assignment = (
        <div className="formula">
          {result.name} <ColorText color="info">{result.valueString}</ColorText>{' '}
          = {result.formula}
        </div>
      )

    if (node.info.pivot || node.meta.op === 'const') {
      result.prec = Infinity

      if (result.assignment) {
        result.formulas = [result.assignment, ...result.formulas]
        delete result.assignment
      }
    }
  }
  return result
}

function computeFormulaDisplay(
  node: CalcResult<number>,
  info: Info & InfoExtra
): CalcDisplay {
  const details = {
    add: { head: '', sep: ' + ', tail: '', prec: 1 },
    mul: { head: '', sep: ' * ', tail: '', prec: 2 },
    max: { head: 'Max(', sep: ', ', tail: ')', prec: Infinity },
    min: { head: 'Min(', sep: ', ', tail: ')', prec: Infinity },
  } as const

  const { op, ops } = node.meta
  const result: CalcDisplay = {
    prec: Infinity,
    formula: '',
    valueString: valueString(node.value, info.unit, info.fixed),
    formulas: [...new Set(ops.flatMap((op) => GetCalcDisplay(op).formulas))],
  }
  const components: ReactNode[] = []

  function addComponents(node: CalcResult<number>, p: number) {
    const display = GetCalcDisplay(node)
    if (p > display.prec) components.push('(')
    if (display.name && (node.info.pivot || node.meta.op === 'const'))
      components.push(
        <>
          <span style={{ fontSize: '85%' }}>{display.name}</span>{' '}
          {display.valueString}
        </>
      )
    else components.push(display.formula)
    if (p > display.prec) components.push(')')
  }

  switch (op) {
    case 'const':
      components.push(result.valueString)
      break
    case 'add':
    case 'mul':
    case 'min':
    case 'max': {
      if (ops.length === 1) result.prec = GetCalcDisplay(ops[0]).prec
      else result.prec = details[op].prec
      const { head, sep, tail, prec } = details[op]
      components.push(head)
      ops.forEach((op, i) => {
        if (i !== 0) components.push(sep)
        addComponents(op, prec)
      })
      components.push(tail)
      break
    }
    case 'sum_frac': {
      result.prec = details.mul.prec
      addComponents(ops[0], details.mul.prec)
      components.push(' / (')
      addComponents(ops[0], details.add.prec)
      components.push(' + ')
      addComponents(ops[1], details.add.prec)
      components.push(')')
      break
    }
    case 'res': {
      const [preRes] = ops
      if (preRes.value >= 0.75) {
        result.prec = details.mul.prec
        components.push('100% / (100% + 4 * ')
        addComponents(preRes, details.mul.prec)
        components.push(')')
      } else if (preRes.value >= 0) {
        result.prec = details.add.prec
        components.push('100% - ')
        addComponents(preRes, details.add.prec)
      } else {
        result.prec = details.add.prec
        components.push('100% - ')
        addComponents(preRes, details.mul.prec)
        components.push(' / 2')
      }
    }
  }

  components.filter((c) => c)
  result.formula = (
    <>
      {components.map((x, i) => (
        <span key={i}>{x}</span>
      ))}
    </>
  )

  return result
}
