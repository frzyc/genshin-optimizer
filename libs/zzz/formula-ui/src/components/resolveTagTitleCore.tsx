import { ColorText } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import type { ReactNode } from 'react'
import { isAbilityFormulaTag } from '../abilityTag'
import { AbilityRowTitle } from '../char/abilityFormulaLabels'
import { getVariant } from '../char/util'
import { TagFallbackLabel } from './TagFallbackLabel'

export type ResolveTagTitleOptions = {
  showPercent?: boolean
  /** Sheet field rows must not read `tagFieldMap` for their own tag. */
  skipTagFieldMap?: boolean
  /** Resolve conditional labels via live calc (TagDisplay only). */
  includeCond?: boolean
  wrapColor?: boolean
}

export function abilityRowTitleNode(tag: Tag): ReactNode | undefined {
  const charKey = tag.sheet as CharacterKey | undefined
  if (charKey && isAbilityFormulaTag(tag)) {
    return <AbilityRowTitle charKey={charKey} tag={tag} />
  }
  return undefined
}

export function resolveTagTitleFallback(
  tag: Tag,
  showPercent?: boolean
): ReactNode {
  return <TagFallbackLabel tag={tag} showPercent={showPercent} />
}

export function wrapTagTitle(
  tag: Tag,
  content: ReactNode,
  wrapColor: boolean
): ReactNode {
  if (!wrapColor) return content
  return <ColorText color={getVariant(tag)}>{content}</ColorText>
}

/** Tag → label without reading `tagFieldMap` (safe during sheet module init). */
export function resolveTagTitleCore(
  tag: Tag,
  { showPercent, wrapColor = true }: ResolveTagTitleOptions = {}
): ReactNode {
  const content =
    abilityRowTitleNode(tag) ?? resolveTagTitleFallback(tag, showPercent)
  return wrapTagTitle(tag, content, wrapColor)
}
