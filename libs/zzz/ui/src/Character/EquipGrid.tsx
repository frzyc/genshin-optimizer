import { objKeyMap, objMap } from '@genshin-optimizer/common/util'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import { type DiscIds } from '@genshin-optimizer/zzz/db'
import { useDiscs, useWengine } from '@genshin-optimizer/zzz/db-ui'
import { Box, Grid } from '@mui/material'
import { CompactDiscCard, DiscSetCardCompact } from '../Disc'
import { EmptyCompactCard } from '../util'
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
    <Box>
      <Grid item columns={columns} container spacing={spacing}>
        <Grid item xs={1} key={wengine?.id}>
          {wengine ? (
            <CompactWengineCard wengineId={wengine.id} onClick={onClick} />
          ) : (
            // TODO: Translation
            <EmptyCompactCard
              placeholder={'No Wengine Equipped'}
              onClick={onClick}
            />
          )}
        </Grid>
        <Grid item {...objMap(columns, (br) => (8 % br ? 2 : 1))}>
          <DiscSetCardCompact discs={discs} />
        </Grid>

        {!!discs &&
          Object.entries(discs).map(([slotKey, disc]) => (
            <Grid item xs={1} key={disc?.id || slotKey}>
              {disc ? (
                <CompactDiscCard disc={disc} onClick={onClick} />
              ) : (
                // TODO: Translation
                <EmptyCompactCard
                  placeholder={`Disc Slot ${slotKey}`}
                  onClick={onClick}
                />
              )}
            </Grid>
          ))}
      </Grid>
    </Box>
  )
}
