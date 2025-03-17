import { objKeyMap } from '@genshin-optimizer/common/util'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { type DiscIds } from '@genshin-optimizer/zzz/db'
import { useDiscs, useWengine } from '@genshin-optimizer/zzz/db-ui'
import { Grid } from '@mui/material'
import { Stack } from '@mui/system'
import { CompactDiscCard, DiscSetCardCompact } from '../Disc'
import { CompactWengineCard } from '../Wengine'
const emptyDiscs = objKeyMap(allDiscSlotKeys, () => undefined)
export function EquipGrid({
  discIds = emptyDiscs,
  wengineId,
  columns,
  onClick,
  spacing = 1,
}: {
  discIds?: DiscIds
  wengineId?: string
  columns: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>
  onClick?: () => void
  spacing?: number
}) {
  const discs = useDiscs(discIds)
  const wengine = useWengine(wengineId)
  return (
    <Grid item columns={columns} container spacing={spacing}>
      <Grid item xs={1} key={wengine?.id}>
        <Stack spacing={1}>
          <CompactWengineCard wengineId={wengine?.id} onClick={onClick} />
          <DiscSetCardCompact discs={discs} />
        </Stack>
      </Grid>

      <Grid container item xs={9} spacing={1}>
        {!!discs &&
          Object.entries(discs).map(([slotKey, disc]) => (
            <Grid item xs={9} sm={4} key={disc?.id || slotKey}>
              <CompactDiscCard
                disc={disc as ICachedDisc}
                slotKey={slotKey}
                onClick={onClick}
              />
            </Grid>
          ))}
      </Grid>
    </Grid>
  )
}
