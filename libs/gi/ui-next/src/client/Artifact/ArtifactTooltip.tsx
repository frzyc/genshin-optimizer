import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import {
  BootstrapTooltip,
  SqBadge,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { clamp } from '@genshin-optimizer/common/util'
import type { RarityKey } from '@genshin-optimizer/gi/consts'
import type { Artifact } from '@genshin-optimizer/gi/frontend-gql'
import { SlotIcon, StatIcon } from '@genshin-optimizer/gi/svgicons'
import {
  artifactLevelVariant,
  ArtifactSetName,
  ArtifactSetSlotName,
  getVariant,
  IconStatDisplay,
} from '@genshin-optimizer/gi/ui'
import { getMainStatDisplayStr } from '@genshin-optimizer/gi/util'
import type { Palette } from '@mui/material'
import { Box, Skeleton, Typography } from '@mui/material'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'

import LocationName from '../LocationName'

export default function ArtifactTooltip({
  artifact,
  children,
}: {
  artifact: Artifact
  children: JSX.Element
}) {
  const fallback = (
    <Box>
      <Skeleton variant="rectangular" width={100} height={100} />
    </Box>
  )
  const title = (
    <Suspense fallback={fallback}>
      <ArtifactData artifact={artifact} />
    </Suspense>
  )

  return (
    <BootstrapTooltip placement="top" title={title} disableInteractive>
      {children}
    </BootstrapTooltip>
  )
}
function ArtifactData({ artifact }: { artifact: Artifact }) {
  const { t: tk } = useTranslation('statKey_gen')
  const { slotKey, level, rarity, mainStatKey, substats, setKey } = artifact
  const mainVariant = getVariant(mainStatKey)
  return (
    <Box p={1}>
      <Typography variant="h6">
        <SlotIcon slotKey={slotKey} iconProps={iconInlineProps} />{' '}
        <ArtifactSetSlotName setKey={setKey} slotKey={slotKey} />
      </Typography>
      <Typography variant="subtitle1" color={`${mainVariant}.main`}>
        <StatIcon statKey={mainStatKey} iconProps={iconInlineProps} />{' '}
        {tk(mainStatKey)}{' '}
        {getMainStatDisplayStr(mainStatKey, rarity as RarityKey, level)}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <StarsDisplay stars={rarity as RarityKey} />
        <SqBadge color={artifactLevelVariant(level)}>+{level}</SqBadge>{' '}
      </Typography>
      <Box py={1}>
        {substats.map(
          ({ value, key }) =>
            !!(value && key) && (
              <IconStatDisplay
                key={key}
                statKey={key}
                value={value}
                color={`roll${clamp(1, 1, 6)}` as keyof Palette} //TODO: stat.rolls.length instead of 1
                prefix="+"
              />
            )
        )}
      </Box>

      <Typography color="success.main">
        <ArtifactSetName setKey={setKey} />
      </Typography>
      <LocationName color="secondary.main" location={artifact.location} />
    </Box>
  )
}
