import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Tag } from '@genshin-optimizer/gi/formula'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import { getTagLabel, tagLabelStr, warnUnresolvedTagLabel } from '../tagLabel'

/**
 * Default tag → label: `getTagLabel` then production GI `KeyMap` / extra Pando labels.
 * Authored sheet titles are resolved before this in `TagDisplay`.
 */
export function TagLabel({ tag }: { tag: Tag }) {
  const key = getTagLabel(tag)
  if (!key) return null
  const mapped = tagLabelStr(key)
  if (!mapped) {
    warnUnresolvedTagLabel(tag, key)
    // Never paint the percent() dummy query as a title.
    if (key === '_' || shouldShowDevComponents) return null
    return <>{key}</>
  }
  return (
    <span>
      <StatIcon statKey={key} iconProps={iconInlineProps} /> {mapped}
    </span>
  )
}
