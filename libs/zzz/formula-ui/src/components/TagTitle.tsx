import { ColorText } from '@genshin-optimizer/common/ui'
import { evalIfFunc } from '@genshin-optimizer/common/util'
import type { Calculator as GameOptCalculator } from '@genshin-optimizer/game-opt/engine'
import {
  Read,
  stripCalcContextTag,
  type Tag,
} from '@genshin-optimizer/zzz/formula'
import { isValidElement, type ReactNode } from 'react'
import { isAbilityFormulaTag } from '../abilityTag'
import { AbilityRowTitle } from '../char/abilityFormulaLabels'
import { getCondMap, tagFieldSubset } from '../char/tagFieldMap'
import { getVariant } from '../char/util'
import { useZzzCalcContext } from '../hooks/useZzzCalcContext'
import { TagLabel } from './TagLabel'

function isTagTitleElement(node: ReactNode): boolean {
  return isValidElement(node) && node.type === TagTitle
}

/** Hand-written sheet / CharBase title; skip titles that are themselves TagTitle. */
function authoredSheetTitle(tag: Tag): ReactNode | undefined {
  for (const field of tagFieldSubset(tag)) {
    const title = field.title
    if (title == null || isTagTitleElement(title)) continue
    return title
  }
  return undefined
}

function TagTitleContent({
  tag,
  showPercent,
  includeCond = false,
}: {
  tag: Tag
  showPercent?: boolean
  includeCond?: boolean
}) {
  const calc = useZzzCalcContext()
  const listingTag = stripCalcContextTag(tag)

  if (isAbilityFormulaTag(tag)) {
    return <AbilityRowTitle tag={tag} />
  }

  const ownedTitle = authoredSheetTitle(listingTag)
  if (ownedTitle) return ownedTitle

  if (includeCond && tag.qt === 'cond' && tag.q && tag.sheet && calc) {
    const cond = getCondMap().get(`${tag.sheet}:${tag.q}`)
    if (cond)
      return evalIfFunc(
        cond.label,
        calc as GameOptCalculator,
        calc.compute(new Read(tag, 'max')).val
      )
  }

  return <TagLabel tag={tag} showPercent={showPercent} />
}

/** Unified tag → label for field rows, TagDisplay, and catalog titles. */
export function TagTitle({
  tag,
  showPercent,
  includeCond = false,
}: {
  tag: Tag
  showPercent?: boolean
  includeCond?: boolean
}) {
  return (
    <ColorText color={getVariant(tag)}>
      <TagTitleContent
        tag={tag}
        showPercent={showPercent}
        includeCond={includeCond}
      />
    </ColorText>
  )
}
