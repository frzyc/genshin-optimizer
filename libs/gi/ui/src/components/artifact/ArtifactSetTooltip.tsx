import { BootstrapTooltip, SqBadge } from '@genshin-optimizer/common/ui'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/i18n'
import { getArtSheet } from '@genshin-optimizer/gi/sheets'
import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'

export function ArtifactSetTooltip({
  children,
  setKey,
  numInSet = 5,
}: {
  children: JSX.Element
  setKey: ArtifactSetKey
  numInSet?: number
}) {
  return (
    <BootstrapTooltip
      placement="top"
      title={<ArtifactSetTooltipContent setKey={setKey} numInSet={numInSet} />}
      disableInteractive
    >
      {children}
    </BootstrapTooltip>
  )
}
export function ArtifactSetTooltipContent({
  setKey,
  numInSet = 5,
}: {
  setKey: ArtifactSetKey
  numInSet?: number
}) {
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width={100} height={100} />}
    >
      <SetToolTipTitle numInSet={numInSet} setKey={setKey} />
    </Suspense>
  )
}
function SetToolTipTitle({
  setKey,
  numInSet = 5,
}: {
  setKey: ArtifactSetKey
  numInSet?: number
}) {
  const { t } = useTranslation('sheet')
  const artifactSheet = getArtSheet(setKey)
  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      {Object.keys(artifactSheet.setEffects).map((setNum) => (
        <Box
          key={setNum}
          sx={{ opacity: Number.parseInt(setNum) <= numInSet ? 1 : 0.5 }}
        >
          <Typography>
            <SqBadge color="success">{t(`${setNum}set`)}</SqBadge>
          </Typography>
          <Typography>
            <Translate
              ns={`artifact_${setKey}_gen`}
              key18={`setEffects.${setNum}`}
            />
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}
