import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allRelicSlotKeys } from '@genshin-optimizer/sr/consts'
import {
  initCharTC,
  type IBuildTc,
  type ICachedLightCone,
  type RelicIds,
  type TeammateDatum,
} from '@genshin-optimizer/sr/db'
import {
  useBuild,
  useBuildTc,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr/db-ui'
import {
  LightConeCardCompact,
  LightConeCardCompactEmpty,
  LightConeCardCompactObj,
  RelicCardCompact,
  RelicMainsCardCompact,
  RelicSetCardCompact,
  RelicSubCard,
} from '@genshin-optimizer/sr/ui'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
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
  const [dbTCDirty, setDbTCDirty] = useForceUpdate()
  const buildIds = useMemo(
    () => dbDirty && database.builds.getBuildIds(characterKey),
    [dbDirty, database, characterKey]
  )
  const buildTcIds = useMemo(
    () => dbTCDirty && database.buildTcs.getBuildTcIds(characterKey),
    [dbTCDirty, database, characterKey]
  )
  useEffect(() => {
    database.builds.followAny(setDbDirty)
  }, [database.builds, setDbDirty])
  useEffect(() => {
    database.buildTcs.followAny(setDbTCDirty)
  }, [database.buildTcs, setDbTCDirty])

  return (
    <CardThemed bgt="dark">
      <CardHeader title="Builds" />
      <Divider />
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6">Equipped build</Typography>
          <EquippedBuild />
          <Typography variant="h6">Other builds</Typography>
          {/* TODO: new Build button */}
          {buildIds.map((buildId) => (
            <Build key={buildId} buildId={buildId} />
          ))}
          <Typography variant="h6">TC builds</Typography>
          <Button
            fullWidth
            onClick={() => database.buildTcs.new(initCharTC(characterKey))}
          >
            New TC Build
          </Button>
          {buildTcIds.map((buildTcId) => (
            <BuildTC key={buildTcId} buildTcId={buildTcId} />
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
    teammateDatum: { characterKey, buildType, buildId, buildTcId },
  } = useTeamContext()

  return useMemo(
    () => ({
      active:
        buildType === 'equipped'
          ? buildType === newBuildType
          : buildType === 'real'
          ? buildId === newBuildId
          : buildType === 'tc' && buildTcId === newBuildId,
      onClick: () => {
        database.teams.set(teamId, (team) => {
          const teammateDatum = team.teamMetadata.find(
            (teammateDatum) => teammateDatum?.characterKey === characterKey
          )
          if (!teammateDatum) {
            console.error(
              `Teammate data not found for character ${characterKey}`
            )
            return
          }
          teammateDatum.buildType = newBuildType
          if (newBuildId === 'real' && newBuildId)
            teammateDatum.buildId = newBuildId
          if (newBuildType === 'tc' && newBuildId)
            teammateDatum.buildTcId = newBuildId
        })
      },
    }),
    [
      buildId,
      buildTcId,
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
        <EquipRow relicIds={equippedRelics} lightConeId={equippedLightCone} />
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
      buildGrid={<EquipRow relicIds={relicIds} lightConeId={lightConeId} />}
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

export function EquipRow({
  relicIds,
  lightConeId,
}: {
  relicIds: RelicIds
  lightConeId?: string
}) {
  const { database } = useDatabaseContext()
  const sets = useMemo(() => {
    const sets: Partial<Record<RelicSetKey, number>> = {}
    Object.values(relicIds).forEach((relicId) => {
      const setKey = database.relics.get(relicId)?.setKey
      if (!setKey) return
      sets[setKey] = (sets[setKey] || 0) + 1
    })
    console.log({ sets, relicIds })
    return Object.fromEntries(
      Object.entries(sets)
        .map(([setKey, count]): [RelicSetKey, number] => {
          if (count >= 4) return [setKey as RelicSetKey, 4]
          if (count >= 2) return [setKey as RelicSetKey, 2]
          return [setKey as RelicSetKey, 0]
        })
        .filter(([, count]) => count > 0)
    ) as Partial<Record<RelicSetKey, 2 | 4>>
  }, [database.relics, relicIds])
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <LightConeCardCompact bgt="light" lightConeId={lightConeId} />
      {allRelicSlotKeys.map((slot) => (
        <RelicCardCompact
          key={slot}
          bgt="light"
          relicId={relicIds[slot]}
          slotKey={slot}
          showLocation
        />
      ))}
      <RelicSetCardCompact bgt="light" sets={sets} />
    </Box>
  )
}
export function BuildTC({ buildTcId }: { buildTcId: string }) {
  const build = useBuildTc(buildTcId)!
  const { lightCone, relic, name, description } = build
  const { active, onClick } = useActiveBuildSwap('tc', buildTcId)
  return (
    <BuildBase
      name={name}
      description={description}
      onClick={onClick}
      active={active}
      buildGrid={<EquipRowTC relic={relic} lightCone={lightCone} />}
    />
  )
}

export function EquipRowTC({
  relic,
  lightCone,
}: {
  relic: IBuildTc['relic']
  lightCone: IBuildTc['lightCone']
}) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {lightCone ? (
        <LightConeCardCompactObj
          bgt="light"
          lightCone={lightCone as ICachedLightCone}
        />
      ) : (
        <LightConeCardCompactEmpty bgt="light" />
      )}
      <RelicMainsCardCompact bgt="light" slots={relic.slots} />
      <RelicSubCard
        relic={relic}
        keys={['hp', 'hp_', 'def', 'def_']}
        bgt="light"
      />
      <RelicSubCard
        relic={relic}
        keys={['atk', 'atk_', 'crit_', 'crit_dmg_']}
        bgt="light"
      />
      <RelicSubCard
        relic={relic}
        keys={['spd', 'eff_', 'eff_res_', 'brEffect_']}
        bgt="light"
      />
    </Box>
  )
}
