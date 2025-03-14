import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { SqBadge } from '@genshin-optimizer/common/ui'
import { notEmpty } from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { getArtSheet } from '@genshin-optimizer/gi/sheets'
import { SlotIcon } from '@genshin-optimizer/gi/svgicons'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
import { ArtifactSetTooltip } from './ArtifactSetTooltip'
import { ArtifactSetName } from './ArtifactTrans'

type ArtifactSetBadgesProps = {
  artifacts: (ICachedArtifact | undefined)[]
}
export function ArtifactSetBadges({ artifacts }: ArtifactSetBadgesProps) {
  const setToSlots = useMemo(() => {
    const setToSlots: Partial<Record<ArtifactSetKey, ArtifactSlotKey[]>> =
      artifacts.filter(notEmpty).reduce(
        (acc, curr) => {
          acc[curr.setKey]
            ? acc[curr.setKey]!.push(curr.slotKey)
            : (acc[curr.setKey] = [curr.slotKey])
          return acc
        },
        {} as Partial<Record<ArtifactSetKey, ArtifactSlotKey[]>>,
      )
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
            slotarr2.length - slotarr1.length,
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
      <ArtifactSetTooltip setKey={setKey} numInSet={numInSet}>
        <SqBadge sx={{ height: '100%' }} color={'primary'}>
          <Typography>
            {slotarr.map((slotKey) => (
              <SlotIcon
                key={slotKey}
                slotKey={slotKey}
                iconProps={iconInlineProps}
              />
            ))}{' '}
            <ArtifactSetName setKey={setKey} />
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
