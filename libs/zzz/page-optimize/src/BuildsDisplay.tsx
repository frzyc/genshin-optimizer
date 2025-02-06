import { CardThemed, SqBadge } from '@genshin-optimizer/common/ui'
import { notEmpty, valueString } from '@genshin-optimizer/common/util'
import type { LocationKey } from '@genshin-optimizer/zzz/consts'
import type { Stats } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext, useDisc } from '@genshin-optimizer/zzz/db-ui'
import type { BuildResult } from '@genshin-optimizer/zzz/solver'
import { applyCalc, convertDiscToStats } from '@genshin-optimizer/zzz/solver'
import { DiscCard } from '@genshin-optimizer/zzz/ui'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useCharacterContext } from './CharacterContext'
import { StatsDisplay } from './StatsDisplay'

export function BuildsDisplay({
  location,
  builds,
  stats,
}: {
  location: LocationKey
  builds: BuildResult[]
  stats: Stats
}) {
  return (
    <Stack spacing={1}>
      {builds.map((b, i) => (
        <Build
          locationKey={location}
          index={i}
          build={b}
          baseStats={stats}
          key={`${i}_${b.value}`}
        />
      ))}
    </Stack>
  )
}

function Build({
  locationKey,
  index,
  build,
  baseStats,
}: {
  locationKey: LocationKey
  index: number
  build: BuildResult
  baseStats: Stats
}) {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()
  const sum = useMemo(
    () =>
      applyCalc(
        baseStats,
        character?.conditionals ?? {},
        Object.values(build.discIds)
          .map((d) => database.discs.get(d))
          .filter(notEmpty)
          .map(convertDiscToStats)
      ),
    [baseStats, build.discIds, character, database.discs]
  )
  const onEquip = useCallback(() => {
    Object.values(build.discIds).forEach((dId) => {
      database.discs.set(dId, { location: locationKey })
    })
  }, [database.discs, locationKey, build.discIds])
  return (
    <CardThemed>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography>
            <SqBadge>{index + 1}</SqBadge>
          </Typography>
          <Typography sx={{ flexGrow: 1 }}>
            Calculated Value: <strong>{valueString(build.value)}</strong>
          </Typography>

          <Button size="small" disabled={!locationKey} onClick={onEquip}>
            Equip to {locationKey}
          </Button>
        </Box>
        <StatsDisplay stats={sum} />
        <Box>
          <Grid
            container
            spacing={1}
            columns={{ xs: 2, sm: 3, md: 3, lg: 4, xl: 6 }}
          >
            {Object.values(build.discIds).map((dId) => (
              <Grid item key={dId} xs={1}>
                <DiscCardWrapper discId={dId} key={dId} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </CardThemed>
  )
}
export function DiscCardWrapper({ discId }: { discId: string }) {
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
