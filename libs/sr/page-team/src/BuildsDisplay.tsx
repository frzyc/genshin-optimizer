import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { allRelicSlotKeys } from '@genshin-optimizer/sr/consts'
import type { RelicIds, TeammateDatum } from '@genshin-optimizer/sr/db'
import {
  useBuild,
  useCharacterContext,
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
import {
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
} from '@mui/material'
import type { ReactNode } from 'react'
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
    <CardThemed bgt="dark">
      <CardHeader title="Builds" />
      <Divider />
      <CardContent>
        <Stack spacing={1}>
          <EquippedBuild />
          {buildIds.map((buildId) => (
            <Build key={buildId} buildId={buildId} />
          ))}
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
function useActiveBuildSwap(
  newBuildType: TeammateDatum['buildType'],
  newBuildId = ''
) {
  const { database } = useDatabaseContext()
  const {
    teamId,
    teammateDatum: { characterKey, buildType, buildId },
  } = useTeamContext()

  return useMemo(
    () => ({
      active:
        buildType === 'equipped'
          ? buildType === newBuildType
          : buildType === 'real' && buildId === newBuildId,
      onClick: () => {
        database.teams.set(teamId, (team) => {
          const teammateDatum = team.teamMetadata.find(
            (teammateDatum) => teammateDatum?.characterKey === characterKey
          )
          if (!teammateDatum) return
          teammateDatum.buildType = newBuildType
          if (newBuildId) teammateDatum.buildId = newBuildId
        })
      },
    }),
    [
      buildId,
      buildType,
      characterKey,
      database.teams,
      newBuildId,
      newBuildType,
      teamId,
    ]
  )
}
export function EquippedBuild() {
  const character = useCharacterContext()!
  const { equippedRelics, equippedLightCone } = character
  const { active, onClick } = useActiveBuildSwap('equipped')
  return (
    <BuildBase
      name="Equipped"
      onClick={onClick}
      active={active}
      buildGrid={
        <BuildGridBase
          relicIds={equippedRelics}
          lightConeId={equippedLightCone}
        />
      }
    />
  )
}
export function Build({ buildId }: { buildId: string }) {
  const build = useBuild(buildId)!
  const { relicIds, lightConeId, name, description } = build
  const { active, onClick } = useActiveBuildSwap('real', buildId)
  return (
    <BuildBase
      name={name}
      description={description}
      onClick={onClick}
      active={active}
      buildGrid={
        <BuildGridBase relicIds={relicIds} lightConeId={lightConeId} />
      }
    />
  )
}
function BuildBase({
  name,
  description,
  buildGrid,
  active,
  onClick,
}: {
  name: string
  description?: string
  buildGrid: ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <CardThemed
      sx={(theme) => ({
        outline: active ? `solid ${theme.palette.success.main}` : undefined,
      })}
    >
      {/* Disable the onClick swap when its the active build */}
      <CardActionArea onClick={onClick} disabled={active}>
        <CardHeader title={name} subheader={description} />
        <Divider />
        <CardContent>{buildGrid}</CardContent>
      </CardActionArea>
    </CardThemed>
  )
}

/**
 * A Grid of Lightcone + relics
 * @returns
 */
export function BuildGridBase({
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
              <EmptyRelicCard slot={slot} bgt="light" />
            )}
          </Grid>
        )
      })}
    </Grid>
  )
}
