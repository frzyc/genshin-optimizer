import { CardThemed } from '@genshin-optimizer/common/ui'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import { Skeleton, Stack } from '@mui/material'
import { Suspense } from 'react'
import { ArtifactMainLevelSlot } from './ArtifactMainLevelSlot'
import { ArtifactSetsEditor } from './ArtifactSetsEditor'

export function ArtifactMainStatAndSetEditor({
  disabled = false,
}: {
  disabled?: boolean
}) {
  return (
    <Stack spacing={1}>
      <CardThemed bgt="light" sx={{ p: 1 }}>
        <Stack spacing={1}>
          {allArtifactSlotKeys.map((s) => (
            <ArtifactMainLevelSlot key={s} slotKey={s} disabled={disabled} />
          ))}
        </Stack>
      </CardThemed>
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={200} />}
      >
        <ArtifactSetsEditor disabled={disabled} />
      </Suspense>
    </Stack>
  )
}
