import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import {
  BootstrapTooltip,
  SqBadge,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { clamp } from '@genshin-optimizer/common/util'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { KeyMap } from '@genshin-optimizer/gi/keymap'
import { SlotIcon, StatIcon } from '@genshin-optimizer/gi/svgicons'
import { getMainStatDisplayStr } from '@genshin-optimizer/gi/util'
import { Box, Skeleton, Typography } from '@mui/material'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { LocationName } from '../character'
import { ArtifactSetName, ArtifactSetSlotName } from './ArtifactTrans'
import { IconStatDisplay } from './IconStatDisplay'
import type { RollColorKey } from './util'
import { artifactLevelVariant } from './util'

export function ArtifactTooltip({
  art,
  children,
}: {
  art: ICachedArtifact
  children: JSX.Element
}) {
  const title = (
    <Suspense
      fallback={
        <Box>
          <Skeleton variant="rectangular" width={100} height={100} />
        </Box>
      }
    >
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
  const {
    setKey,
    slotKey,
    level,
    rarity,
    mainStatKey,
    substats,
    unactivatedSubstats,
  } = art
  const mainVariant = KeyMap.getVariant(mainStatKey)
  return (
    <Box p={1}>
      <Typography variant="h6">
        <SlotIcon slotKey={slotKey} iconProps={iconInlineProps} />{' '}
        <ArtifactSetSlotName setKey={setKey} slotKey={slotKey} />
      </Typography>
      <Typography variant="subtitle1" color={`${mainVariant}.main`}>
        <StatIcon statKey={mainStatKey} iconProps={iconInlineProps} />{' '}
        {tk(mainStatKey)} {getMainStatDisplayStr(mainStatKey, rarity, level)}
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
        <SqBadge color={artifactLevelVariant(level)}>+{level}</SqBadge>{' '}
      </Typography>
      <Box py={1}>
        {substats.map(
          ({ value, key, rolls }) =>
            !!(value && key) && (
              <IconStatDisplay
                key={key}
                statKey={key}
                value={value}
                color={`roll${clamp(rolls.length, 1, 6)}` as RollColorKey} //TODO: stat.rolls.length instead of 1
                prefix="+"
              />
            )
        )}
        {unactivatedSubstats?.map(
          ({ value, key, rolls }) =>
            !!(value && key) && (
              <IconStatDisplay
                key={key}
                statKey={key}
                value={value}
                color={'secondary'}
                prefix="+"
              />
            )
        )}
      </Box>

      <Typography color="success.main">
        <ArtifactSetName setKey={setKey} />
      </Typography>
      <LocationName color="secondary.main" location={art.location} />
    </Box>
  )
}
