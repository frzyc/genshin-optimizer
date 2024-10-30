import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { allRelicSlotKeys } from '@genshin-optimizer/sr/consts'
import type { RelicIds } from '@genshin-optimizer/sr/db'
import {
  useBuild,
  useDatabaseContext,
  useLightCone,
  useRelics,
} from '@genshin-optimizer/sr/db-ui'
import {
  EmptyRelicCard,
  LightConeCard,
  RelicCard,
} from '@genshin-optimizer/sr/ui'
import type { GridOwnProps } from '@mui/material'
import { CardContent, Grid, Stack } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useTeamContext } from './context'
export function BuildsDisplay() {
  const { database } = useDatabaseContext()
  const {
    teammateDatum: { characterKey },
  } = useTeamContext()
  const [dbDirty, setDbDirty] = useForceUpdate()
  const buildIds = useMemo(
    () => dbDirty && database.builds.getBuildIds(characterKey),
    [dbDirty, database, characterKey]
  )

  useEffect(() => {
    database.builds.followAny(setDbDirty)
  }, [database.builds, dbDirty, setDbDirty])
  return (
    <CardThemed>
      <CardContent>
        <Stack spacing={1}>
          {buildIds.map((buildId) => (
            <BuildDisplay key={buildId} buildId={buildId} />
          ))}
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
export function BuildDisplay({ buildId }: { buildId: string }) {
  const build = useBuild(buildId)!
  const { relicIds, lightConeId } = build

  return <BuildDisplayBase relicIds={relicIds} lightConeId={lightConeId} />
}

export function BuildDisplayBase({
  relicIds,
  lightConeId,
  columns = 3,
}: {
  relicIds: RelicIds
  lightConeId?: string
  columns?: GridOwnProps['columns']
}) {
  const relics = useRelics(relicIds)
  const lightcone = useLightCone(lightConeId)
  return (
    <Grid container columns={columns} spacing={1}>
      {lightcone && (
        <Grid item xs={1}>
          <LightConeCard lightCone={lightcone} />
        </Grid>
      )}
      {allRelicSlotKeys.map((slot) => {
        const relic = relics[slot]
        return (
          <Grid item xs={1} key={`${slot}_${relic?.id}`}>
            {relic ? (
              <RelicCard relic={relic} />
            ) : (
              <EmptyRelicCard slot={slot} />
            )}
          </Grid>
        )
      })}
    </Grid>
  )
}
