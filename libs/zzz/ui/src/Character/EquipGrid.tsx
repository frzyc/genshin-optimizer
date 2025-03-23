import { objKeyMap, objMap } from '@genshin-optimizer/common/util'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { type DiscIds } from '@genshin-optimizer/zzz/db'
import { useDiscs, useWengine } from '@genshin-optimizer/zzz/db-ui'
import { Grid } from '@mui/material'
import { Stack } from '@mui/system'
import { useMemo } from 'react'
import { CompactDiscCard, DiscSetCardCompact } from '../Disc'
import { CompactWengineCard } from '../Wengine'
const emptyDiscs = objKeyMap(allDiscSlotKeys, () => undefined)
const DEFAULT_COLUMNS = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 } as const
export function EquipGrid({
  discIds = emptyDiscs,
  wengineId,
  onClick,
  columns = DEFAULT_COLUMNS,
}: {
  discIds?: DiscIds
  wengineId?: string
  onClick?: () => void
  columns?: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>
}) {
  const discs = useDiscs(discIds)
  const wengine = useWengine(wengineId)
  const discColumns = useMemo(
    () => objMap(columns, (c) => Math.max(c - 1, 1)),
    [columns]
  )
  return (
    <Grid container spacing={1} columns={columns}>
      <Grid item xs={1} key={wengine?.id}>
        <Stack spacing={1}>
          <CompactWengineCard wengineId={wengine?.id} onClick={onClick} />
          <DiscSetCardCompact discs={discs} />
        </Stack>
      </Grid>

      <Grid item {...discColumns}>
        <Grid container spacing={1} columns={discColumns}>
          {!!discs &&
            Object.entries(discs).map(([slotKey, disc]) => (
              <Grid item xs={1} key={disc?.id || slotKey}>
                <CompactDiscCard
                  disc={disc as ICachedDisc}
                  slotKey={slotKey}
                  onClick={onClick}
                />
              </Grid>
            ))}
        </Grid>
      </Grid>
    </Grid>
  )
}
