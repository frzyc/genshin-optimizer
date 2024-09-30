import { ColorText } from '@genshin-optimizer/common/ui'
import type { Tag } from '@genshin-optimizer/sr/formula'
import { getVariant, tagFieldMap } from '@genshin-optimizer/sr/formula-ui'
export function OptimizationTargetDisplay({ tag }: { tag: Tag }) {
  return (
    <ColorText color={getVariant(tag)}>
      {tagFieldMap.subset(tag)[0]?.title || tag.name || tag.q}
    </ColorText>
  )
}
