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
  onClick,
  spacing = 1,
}: {
  discIds?: DiscIds
  wengineId?: string
  onClick?: () => void
  spacing?: number
}) {
  const discs = useDiscs(discIds)
  const wengine = useWengine(wengineId)
  return (
    <Grid item container spacing={spacing}>
      <Grid item xs={12} sm={12} md={5} lg={4} xl={3} key={wengine?.id}>
        <Stack spacing={1}>
          <CompactWengineCard wengineId={wengine?.id} onClick={onClick} />
          <DiscSetCardCompact discs={discs} />
        </Stack>
      </Grid>

      <Grid container item xs={12} sm={12} md={7} lg={8} xl={9} spacing={1}>
        {!!discs &&
          Object.entries(discs).map(([slotKey, disc]) => (
            <Grid item xs={12} sm={12} lg={6} xl={4} key={disc?.id || slotKey}>
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
