import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { lazy, Suspense } from 'react'
import { TagFallbackLabel } from './components/TagFallbackLabel'

const TagDisplay = lazy(() =>
  import('./components/TagDisplay').then((m) => ({ default: m.TagDisplay }))
)

function TagFieldTitle({ tag }: { tag: Tag }) {
  return (
    <Suspense fallback={<TagFallbackLabel tag={tag} />}>
      <TagDisplay tag={tag} />
    </Suspense>
  )
}

export function tagToTagField(tag: Tag): TagField {
  return {
    title: <TagFieldTitle tag={tag} />,
    fieldRef: tag,
  }
}
