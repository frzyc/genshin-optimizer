import { ColorText } from '@genshin-optimizer/common/ui'
import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { getVariant } from './char/util'
import { TagFallbackLabel } from './components/TagFallbackLabel'

/** Sheet field row — uses fallback labels only (no tagFieldMap lookup). */
export function tagToTagField(tag: Tag): TagField {
  return {
    title: (
      <ColorText color={getVariant(tag)}>
        <TagFallbackLabel tag={tag} />
      </ColorText>
    ),
    fieldRef: tag,
  }
}
