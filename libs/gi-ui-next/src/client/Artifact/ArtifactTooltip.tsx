import type { RarityKey } from '@genshin-optimizer/consts'
import type { Artifact } from '@genshin-optimizer/gi-frontend-gql'
import { SlotIcon, StatIcon } from '@genshin-optimizer/gi-svgicons'
import {
  ArtifactSetName,
  ArtifactSetSlotName,
  artifactLevelVariant,
  getVariant,
} from '@genshin-optimizer/gi-ui'
import {
  artDisplayValue,
  getMainStatDisplayStr,
} from '@genshin-optimizer/gi-util'
import { iconInlineProps } from '@genshin-optimizer/svgicons'
import {
  BootstrapTooltip,
  SqBadge,
  StarsDisplay,
} from '@genshin-optimizer/ui-common'
import { clamp, unit } from '@genshin-optimizer/util'
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
          (stat) =>
            !!stat.value && (
              <Typography
                key={stat.key}
                color={`roll${clamp(1, 1, 6)}.main`} //TODO: stat.rolls.length
              >
                <StatIcon statKey={stat.key} iconProps={iconInlineProps} />{' '}
                {tk(stat.key)}{' '}
                <strong>{`+${artDisplayValue(stat.value, unit(stat.key))}${unit(
                  stat.key
                )}`}</strong>
              </Typography>
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
