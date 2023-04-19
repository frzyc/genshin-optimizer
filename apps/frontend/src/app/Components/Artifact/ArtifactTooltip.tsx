import { Box, Skeleton, Typography } from '@mui/material'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { getArtSheet } from '../../Data/Artifacts'
import Artifact from '../../Data/Artifacts/Artifact'
import KeyMap, { cacheValueString } from '../../KeyMap'
import StatIcon from '../../KeyMap/StatIcon'
import { iconInlineProps } from '../../SVGIcons'
import type { ICachedArtifact, ICachedSubstat } from '../../Types/artifact'
import { clamp } from '../../Util/Util'
import BootstrapTooltip from '../BootstrapTooltip'
import LocationName from '../Character/LocationName'
import SqBadge from '../SqBadge'
import { StarsDisplay } from '../StarDisplay'
import SlotIcon from './SlotIcon'

export default function ArtifactTooltip({
  art,
  children,
}: {
  art: ICachedArtifact
  children: JSX.Element
}) {
  const fallback = (
    <Box>
      <Skeleton variant="rectangular" width={100} height={100} />
    </Box>
  )
  const title = (
    <Suspense fallback={fallback}>
      <ArtifactData art={art} />
    </Suspense>
  )

  return (
    <BootstrapTooltip placement="top" title={title} disableInteractive>
      {children}
    </BootstrapTooltip>
  )
}
function ArtifactData({ art }: { art: ICachedArtifact }) {
  const { t: tk } = useTranslation('statKey_gen')
  const sheet = getArtSheet(art.setKey)
  const { slotKey, level, rarity, mainStatKey, substats } = art
  const slotName = sheet.getSlotName(slotKey)
  const mainStatUnit = KeyMap.unit(mainStatKey)
  const mainVariant = KeyMap.getVariant(mainStatKey)
  return (
    <Box p={1}>
      <Typography variant="h6">
        <SlotIcon slotKey={slotKey} iconProps={iconInlineProps} /> {slotName}
      </Typography>
      <Typography variant="subtitle1" color={`${mainVariant}.main`}>
        <StatIcon statKey={mainStatKey} iconProps={iconInlineProps} />{' '}
        {tk(mainStatKey)}{' '}
        {cacheValueString(
          Artifact.mainStatValue(mainStatKey, rarity, level) ?? 0,
          KeyMap.unit(mainStatKey)
        )}
        {mainStatUnit}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <StarsDisplay stars={rarity} />
        <SqBadge color={Artifact.levelVariant(level)}>+{level}</SqBadge>{' '}
      </Typography>
      <Box py={1}>
        {substats.map(
          (stat: ICachedSubstat) =>
            !!stat.value && (
              <Typography
                key={stat.key}
                color={`roll${clamp(stat.rolls.length, 1, 6)}.main`}
              >
                <StatIcon statKey={stat.key} iconProps={iconInlineProps} />{' '}
                {tk(stat.key)}{' '}
                <strong>{`+${cacheValueString(
                  stat.value,
                  KeyMap.unit(stat.key)
                )}${KeyMap.unit(stat.key)}`}</strong>
              </Typography>
            )
        )}
      </Box>

      <Typography color="success.main">{sheet.name}</Typography>
      <LocationName color="secondary.main" location={art.location} />
    </Box>
  )
}
