import type { Tag } from '@genshin-optimizer/zzz/formula'
import { Suspense, lazy } from 'react'

const TagDisplay = lazy(() =>
  import('./components/TagDisplay').then((m) => ({ default: m.TagDisplay }))
)

/** Defers TagDisplay so sheet modules can call tagToTagField without a tagFieldMap cycle. */
export function TagFieldTitle({
  tag,
  preventRecursion,
}: {
  tag: Tag
  preventRecursion?: boolean
}) {
  return (
    <Suspense fallback={null}>
      <TagDisplay tag={tag} preventRecursion={preventRecursion} />
    </Suspense>
  )
}
