import { ColorText } from '@genshin-optimizer/common/ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { getVariant, tagFieldMap } from '../char'
export function TagDisplay({ tag }: { tag: Tag }) {
  return (
    <ColorText color={getVariant(tag)}>
      {tagFieldMap.subset(tag)[0]?.title || tag.name || tag.q}
    </ColorText>
  )
}
