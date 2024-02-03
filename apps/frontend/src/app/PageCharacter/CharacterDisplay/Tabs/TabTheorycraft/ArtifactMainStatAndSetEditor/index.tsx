import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import { Skeleton, Stack } from '@mui/material'
import { Suspense } from 'react'
import CardLight from '../../../../../Components/Card/CardLight'
import { ArtifactMainLevelSlot } from './ArtifactMainLevelSlot'
import { ArtifactSetsEditor } from './ArtifactSetsEditor'

export function ArtifactMainStatAndSetEditor({
  disabled = false,
}: {
  disabled?: boolean
}) {
  return (
    <Stack spacing={1}>
      <CardLight sx={{ p: 1 }}>
        <Stack spacing={1}>
          {allArtifactSlotKeys.map((s) => (
            <ArtifactMainLevelSlot key={s} slotKey={s} disabled={disabled} />
          ))}
        </Stack>
      </CardLight>
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={200} />}
      >
        <ArtifactSetsEditor disabled={disabled} />
      </Suspense>
    </Stack>
  )
}
