import { ColorText } from '@genshin-optimizer/common/ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { getVariant, tagFieldMap } from '../char'
import { getTagLabel } from '../util'
export function TagDisplay({ tag }: { tag: Tag }) {
  return (
    <ColorText color={getVariant(tag)}>
      {tagFieldMap.subset(tag)[0]?.title || getTagLabel(tag)}
    </ColorText>
  )
}
