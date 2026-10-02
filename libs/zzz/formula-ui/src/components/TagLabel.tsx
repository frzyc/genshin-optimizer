import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import {
  getUnitStr,
  shouldShowDevComponents,
} from '@genshin-optimizer/common/util'
import type { StatKey } from '@genshin-optimizer/zzz/consts'
import { statKeyTextMap } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { isAbilityDim } from '@genshin-optimizer/zzz/formula'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { StatDisplay } from '@genshin-optimizer/zzz/ui'
import {
  getTagLabel,
  namedAbilityDimLabel,
  qualifyMappedLabel,
  stagedStatKey,
  warnUnresolvedTagLabel,
} from '../tagLabel'
import { qtMap } from './qtMap'

/**
 * Default tag → label: `getTagLabel` then `statKeyTextMap` / `StatDisplay`.
 * Authored sheet titles and ability i18n are resolved before this in
 * `TagTitle`.
 */
export function TagLabel({
  tag,
  showPercent,
}: {
  tag: Tag
  showPercent?: boolean
}) {
  if (tag.name && tag.q && isAbilityDim(tag.q)) {
    const label = namedAbilityDimLabel(tag)
    if (label) return <span>{label}</span>
  }

  const key = getTagLabel(tag)
  const mapped = statKeyTextMap[key]
  if (!mapped) {
    warnUnresolvedTagLabel(tag, key)
    if (shouldShowDevComponents) return null
    return <StatDisplay statKey={key as StatKey} showPercent={showPercent} />
  }

  const staged = stagedStatKey(tag.qt, tag.q)
  const qtPrefix =
    staged && key !== staged && tag.qt
      ? qtMap[tag.qt as keyof typeof qtMap]
      : undefined
  const qualified = qualifyMappedLabel(tag, key, mapped)

  if (qualified === mapped && !qtPrefix) {
    return <StatDisplay statKey={key as StatKey} showPercent={showPercent} />
  }

  const iconKey = (tag.attribute ?? key) as StatKey
  const text = qtPrefix ? `${qtPrefix} ${qualified}` : qualified
  return (
    <span>
      <StatIcon statKey={iconKey} iconProps={iconInlineProps} />{' '}
      <span>
        {text}
        {showPercent && getUnitStr((tag.q ?? key) as StatKey)}
      </span>
    </span>
  )
}
