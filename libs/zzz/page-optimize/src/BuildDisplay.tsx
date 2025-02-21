import { CardThemed, SqBadge } from '@genshin-optimizer/common/ui'
import {
  notEmpty,
  objFilter,
  valueString,
} from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import type { Stats } from '@genshin-optimizer/zzz/db'
import {
  useCharacterContext,
  useDatabaseContext,
  useDisc,
  useDiscs,
} from '@genshin-optimizer/zzz/db-ui'
import { applyCalc, convertDiscToStats } from '@genshin-optimizer/zzz/solver'
import { DiscCard } from '@genshin-optimizer/zzz/ui'
import { Box, Button, CardContent, Grid, Typography } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { StatsDisplay } from './StatsDisplay'

export function BuildDisplay({
  index,
  result,
  discIds,
  baseStats,
}: {
  index?: number
  result?: number
  discIds: Record<DiscSlotKey, string>

  baseStats: Stats
}) {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()
  const discs = useDiscs(discIds)
  const sum = useMemo(
    () =>
      applyCalc(
        baseStats,
        character?.conditionals ?? {},
        Object.values(discs).filter(notEmpty).map(convertDiscToStats)
      ),
    [baseStats, character?.conditionals, discs]
  )
  const onEquip = useCallback(() => {
    Object.values(discIds).forEach((dId) => {
      character && database.discs.set(dId, { location: character.key })
    })
  }, [character, database.discs, discIds])
  return (
    <CardThemed>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {typeof index === 'number' && (
            <Typography>
              <SqBadge>{index + 1}</SqBadge>
            </Typography>
          )}
          {typeof result === 'number' && (
            <Typography sx={{ flexGrow: 1 }}>
              Calculated Value: <strong>{valueString(result)}</strong>
            </Typography>
          )}

          {typeof result === 'number' && character?.key && (
            <Button size="small" disabled={!character.key} onClick={onEquip}>
              Equip to {character.key}
            </Button>
          )}
        </Box>
        <StatsDisplay
          stats={objFilter(sum, (_, k) => !(k as string).startsWith('wengine'))}
        />
        <Box>
          <Grid
            container
            spacing={1}
            columns={{ xs: 2, sm: 3, md: 3, lg: 4, xl: 6 }}
          >
            {Object.values(discIds).map((dId, i) => (
              <Grid item key={`${dId}_${i}`} xs={1}>
                <DiscCardWrapper discId={dId} key={dId} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </CardThemed>
  )
}
function DiscCardWrapper({ discId }: { discId: string }) {
  const { database } = useDatabaseContext()
  const disc = useDisc(discId)
  if (!disc) return
  return (
    <DiscCard
      disc={disc}
      setLocation={(location) => database.discs.set(discId, { location })}
    />
  )
}
