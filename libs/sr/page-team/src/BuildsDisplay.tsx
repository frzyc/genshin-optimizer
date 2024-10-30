import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { allRelicSlotKeys } from '@genshin-optimizer/sr/consts'
import {
  useBuild,
  useDatabaseContext,
  useEquippedRelics,
  useLightCone,
} from '@genshin-optimizer/sr/db-ui'
import {
  EmptyRelicCard,
  LightConeCard,
  RelicCard,
} from '@genshin-optimizer/sr/ui'
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
  const relics = useEquippedRelics(relicIds)
  const lightcone = useLightCone(lightConeId)

  return (
    <Grid container columns={3} spacing={1}>
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
