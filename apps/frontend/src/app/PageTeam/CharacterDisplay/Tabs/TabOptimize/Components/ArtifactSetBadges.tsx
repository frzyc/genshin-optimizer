import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
import ArtifactSetTooltip from '../../../../../Components/Artifact/ArtifactSetTooltip'
import SlotIcon from '../../../../../Components/Artifact/SlotIcon'
import SqBadge from '../../../../../Components/SqBadge'
import { getArtSheet } from '../../../../../Data/Artifacts'

type ArtifactSetBadgesProps = {
  artifacts: ICachedArtifact[]
}
export function ArtifactSetBadges({ artifacts }: ArtifactSetBadgesProps) {
  const setToSlots = useMemo(() => {
    const setToSlots: Partial<Record<ArtifactSetKey, ArtifactSlotKey[]>> =
      artifacts
        .filter((arti) => arti)
        .reduce((acc, curr) => {
          acc[curr.setKey]
            ? acc[curr.setKey].push(curr.slotKey)
            : (acc[curr.setKey] = [curr.slotKey])
          return acc
        }, {})
    Object.keys(setToSlots).forEach((setKey) => {
      if (setToSlots[setKey]?.length === 1) delete setToSlots[setKey]
    })
    return setToSlots
  }, [artifacts])
  return (
    <>
      {Object.entries(setToSlots)
        .sort(
          ([_k1, slotarr1], [_k2, slotarr2]) =>
            slotarr2.length - slotarr1.length
        )
        .map(([key, slotarr]) => (
          <ArtifactSetBadge key={key} setKey={key} slotarr={slotarr} />
        ))}
    </>
  )
}
function ArtifactSetBadge({
  setKey,
  slotarr,
}: {
  setKey: ArtifactSetKey
  slotarr: ArtifactSlotKey[]
}) {
  const artifactSheet = getArtSheet(setKey)
  const numInSet = slotarr.length
  const setActive = Object.keys(artifactSheet.setEffects)
    .map((setKey) => parseInt(setKey))
    .filter((setNum) => setNum <= numInSet)
  return (
    <Box>
      <ArtifactSetTooltip artifactSheet={artifactSheet} numInSet={numInSet}>
        <SqBadge sx={{ height: '100%' }} color={'primary'}>
          <Typography>
            {slotarr.map((slotKey) => (
              <SlotIcon
                key={slotKey}
                slotKey={slotKey}
                iconProps={iconInlineProps}
              />
            ))}{' '}
            {artifactSheet.name ?? ''}
            {setActive.map((n, i) => (
              <SqBadge sx={{ ml: 0.5 }} key={'' + n + i} color="success">
                {n}
              </SqBadge>
            ))}
          </Typography>
        </SqBadge>
      </ArtifactSetTooltip>
    </Box>
  )
}
