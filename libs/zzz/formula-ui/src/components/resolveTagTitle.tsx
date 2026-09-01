import { evalIfFunc } from '@genshin-optimizer/common/util'
import type { Calculator as GameOptCalculator } from '@genshin-optimizer/game-opt/engine'
import {
  Read,
  stripCalcContextTag,
  type Tag,
} from '@genshin-optimizer/zzz/formula'
import type { ReactNode } from 'react'
import { getCondMap, tagFieldTitle } from '../char/tagFieldMap'
import { useZzzCalcContext } from '../hooks/useZzzCalcContext'
import {
  abilityRowTitleNode,
  resolveTagTitleCore,
  resolveTagTitleFallback,
  wrapTagTitle,
  type ResolveTagTitleOptions,
} from './resolveTagTitleCore'

export type { ResolveTagTitleOptions } from './resolveTagTitleCore'

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

  const ability = abilityRowTitleNode(tag)
  if (ability) return ability

  const ownedTitle = tagFieldTitle(listingTag)
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

  return resolveTagTitleFallback(tag, showPercent)
}

/** Unified tag → label path for field rows, TagDisplay, and sheet fields. */
export function resolveTagTitle(
  tag: Tag,
  {
    showPercent,
    skipTagFieldMap = false,
    includeCond = false,
    wrapColor = true,
  }: ResolveTagTitleOptions = {}
): ReactNode {
  if (skipTagFieldMap) {
    return resolveTagTitleCore(tag, { showPercent, wrapColor })
  }

  const content = (
    <TagTitleContent
      tag={tag}
      showPercent={showPercent}
      includeCond={includeCond}
    />
  )
  return wrapTagTitle(tag, content, wrapColor)
}
