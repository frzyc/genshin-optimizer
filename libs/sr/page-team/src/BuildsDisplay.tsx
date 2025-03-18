import {
  useBoolState,
  useForceUpdate,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  NumberInputLazy,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type {
  RelicMainStatKey,
  RelicRarityKey,
  RelicSetKey,
  RelicSlotKey,
  RelicSubStatKey,
  RelicSubstatTypeKey,
} from '@genshin-optimizer/sr/consts'
import {
  isCavernRelicSetKey,
  isPlanarRelicSetKey,
  relicMaxLevel,
} from '@genshin-optimizer/sr/consts'
import type {
  BuildTCLightCone,
  BuildTcRelicSlot,
  IBuildTc,
} from '@genshin-optimizer/sr/db'
import {
  type ICachedLightCone,
  type TeammateDatum,
  initCharTC,
} from '@genshin-optimizer/sr/db'
import {
  useBuild,
  useBuildTc,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr/db-ui'
import { SlotIcon } from '@genshin-optimizer/sr/svgicons'
import {
  EquipRow,
  LightConeCardCompactEmpty,
  LightConeCardCompactObj,
  LightConeEditorCard,
  RelicMainStatDropdown,
  RelicMainsCardCompact,
  RelicRarityDropdown,
  RelicSetAutocomplete,
  RelicSetCardCompact,
  RelicSetName,
  RelicSubCard,
  StatDisplay,
} from '@genshin-optimizer/sr/ui'
import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import {
  Box,
  Button,
  ButtonGroup,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTeamContext, useTeammateContext } from './context'
export function BuildsDisplay({ onClose }: { onClose?: () => void }) {
  const { database } = useDatabaseContext()
  const { characterKey } = useTeammateContext()
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
  useEffect(
    () => database.builds.followAny(setDbDirty),
    [database.builds, setDbDirty]
  )
  useEffect(
    () => database.buildTcs.followAny(setDbTCDirty),
    [database.buildTcs, setDbTCDirty]
  )

  return (
    <CardThemed bgt="dark">
      <CardHeader
        title="Builds"
        action={
          onClose ? (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          ) : null
        }
      />
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
  const { characterKey, buildType, buildId, buildTcId } = useTeammateContext()
  const { teamId } = useTeamContext()

  return useMemo(
    () => ({
      active:
        buildType === 'equipped'
          ? buildType === newBuildType
          : buildType === 'real'
            ? buildId === newBuildId
            : buildType === 'tc' && buildTcId === newBuildId,
      onActive: () => {
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
          if (newBuildType === 'real' && newBuildId)
            teammateDatum.buildId = newBuildId
          else if (newBuildType === 'tc' && newBuildId)
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
  const { active, onActive } = useActiveBuildSwap('equipped')
  return (
    <BuildBase
      name="Equipped"
      onActive={onActive}
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
  const { active, onActive } = useActiveBuildSwap('real', buildId)
  return (
    <BuildBase
      name={name}
      description={description}
      onActive={onActive}
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
  onActive: onEquip,
}: {
  name: string
  description?: string
  buildGrid: ReactNode
  active?: boolean
  onActive?: () => void
}) {
  const onEdit = useCallback(() => {}, []) // TODO: implement
  return (
    <CardThemed
      sx={(theme) => ({
        outline: active ? `solid ${theme.palette.success.main}` : undefined,
      })}
    >
      <Box display={'flex'}>
        <CardActionArea onClick={onEdit}>
          <CardHeader title={name} subheader={description} />
        </CardActionArea>
        <Box display={'flex'} alignContent={'center'} sx={{ padding: 1 }}>
          <Button
            size="small"
            color="success"
            onClick={onEquip}
            disabled={active}
          >
            Set Active
          </Button>
        </Box>
      </Box>
      <Divider />
      <CardContent>{buildGrid}</CardContent>
    </CardThemed>
  )
}
export function BuildTC({ buildTcId }: { buildTcId: string }) {
  const build = useBuildTc(buildTcId)
  const { name = 'ERROR', description = 'ERROR' } = build ?? {}
  const { active, onActive: onClick } = useActiveBuildSwap('tc', buildTcId)
  return (
    <BuildBase
      name={name}
      description={description}
      onActive={onClick}
      active={active}
      buildGrid={<EquipRowTC buildTcId={buildTcId} />}
    />
  )
}

export function EquipRowTC({ buildTcId }: { buildTcId: string }) {
  const { database } = useDatabaseContext()
  const build = useBuildTc(buildTcId)!
  const { lightCone, relic } = build

  const [show, onShow, onHide] = useBoolState()
  const [showMainEditor, onShowMainEditor, onHideMainEditor] = useBoolState()
  const [showSubsEditor, onShowSubsEditor, onHideSubsEditor] = useBoolState()
  const [showSetsEditor, onShowSetsEditor, onHideSetsEditor] = useBoolState()
  const onUpdate = useCallback(
    (data: Partial<BuildTCLightCone>) => {
      database.buildTcs.set(buildTcId, (buildTc) => ({
        lightCone: { ...buildTc.lightCone, ...data } as BuildTCLightCone,
      }))
    },
    [buildTcId, database.buildTcs]
  )
  const setSlot = useCallback(
    (slotKey: RelicSlotKey, data: Partial<BuildTcRelicSlot>) => {
      database.buildTcs.set(buildTcId, (buildTc) => ({
        relic: {
          ...buildTc.relic,
          slots: {
            ...buildTc.relic.slots,
            [slotKey]: { ...buildTc.relic.slots[slotKey], ...data },
          },
        },
      }))
    },
    [buildTcId, database.buildTcs]
  )
  const setSubstat = useCallback(
    (statKey: RelicSubStatKey, value: number) => {
      database.buildTcs.set(buildTcId, (buildTc) => ({
        relic: {
          ...buildTc.relic,
          substats: {
            ...buildTc.relic.substats,
            stats: {
              ...buildTc.relic.substats.stats,
              [statKey]: value,
            },
          },
        },
      }))
    },
    [buildTcId, database.buildTcs]
  )
  const setType = useCallback(
    (type: RelicSubstatTypeKey) => {
      database.buildTcs.set(buildTcId, (buildTc) => ({
        relic: {
          ...buildTc.relic,
          substats: {
            ...buildTc.relic.substats,
            type,
          },
        },
      }))
    },
    [buildTcId, database.buildTcs]
  )
  const setSets = useCallback(
    (setKey: RelicSetKey, count: number) => {
      database.buildTcs.set(buildTcId, (buildTc) => ({
        relic: {
          ...buildTc.relic,
          sets: {
            ...buildTc.relic.sets,
            [setKey]: count,
          },
        },
      }))
    },
    [buildTcId, database.buildTcs]
  )
  const removeSet = useCallback(
    (setKey: RelicSetKey) => {
      database.buildTcs.set(buildTcId, (buildTc) => {
        const sets = { ...buildTc.relic.sets }
        delete sets[setKey]
        return {
          relic: {
            ...buildTc.relic,
            sets,
          },
        }
      })
    },
    [buildTcId, database.buildTcs]
  )
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <TCLightconeEditor
        show={show}
        onClose={onHide}
        lightCone={lightCone}
        onUpdate={onUpdate}
      />
      {lightCone ? (
        <LightConeCardCompactObj
          bgt="light"
          lightCone={lightCone as ICachedLightCone}
          onClick={onShow}
        />
      ) : (
        <LightConeCardCompactEmpty bgt="light" onClick={onShow} />
      )}
      <TCRelicSetEditor
        show={showSetsEditor}
        onClose={onHideSetsEditor}
        sets={relic.sets}
        setSets={setSets}
        removeSet={removeSet}
      />
      <RelicSetCardCompact
        bgt="light"
        sets={relic.sets}
        onClick={onShowSetsEditor}
      />
      <TCMainsEditor
        show={showMainEditor}
        onClose={onHideMainEditor}
        slots={relic.slots}
        setSlot={setSlot}
      />
      <RelicMainsCardCompact
        bgt="light"
        slots={relic.slots}
        onClick={onShowMainEditor}
      />
      <TCSubsEditor
        stats={relic.substats.stats}
        show={showSubsEditor}
        onClose={onHideSubsEditor}
        type={relic.substats.type}
        setType={setType}
        setStat={setSubstat}
      />
      <RelicSubCard
        onClick={onShowSubsEditor}
        relic={relic}
        keys={['hp', 'hp_', 'def', 'def_']}
        bgt="light"
      />
      <RelicSubCard
        onClick={onShowSubsEditor}
        relic={relic}
        keys={['atk', 'atk_', 'crit_', 'crit_dmg_']}
        bgt="light"
      />
      <RelicSubCard
        onClick={onShowSubsEditor}
        relic={relic}
        keys={['spd', 'eff_', 'eff_res_', 'brEffect_']}
        bgt="light"
      />
    </Box>
  )
}
function TCLightconeEditor({
  lightCone = {},
  onUpdate,
  show,
  onClose,
}: {
  lightCone?: Partial<BuildTCLightCone>
  onUpdate: (lightCone: Partial<BuildTCLightCone>) => void
  show: boolean
  onClose: () => void
}) {
  return (
    <ModalWrapper open={show} onClose={onClose}>
      <LightConeEditorCard
        onClose={onClose}
        lightCone={lightCone}
        setLightCone={onUpdate}
        hideLocation
      />
    </ModalWrapper>
  )
}
function TCMainsEditor({
  slots,
  show,
  onClose,
  setSlot,
}: {
  slots: IBuildTc['relic']['slots']
  show: boolean
  onClose: () => void
  setSlot: (slotKey: RelicSlotKey, data: Partial<BuildTcRelicSlot>) => void
}) {
  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'sm' }}
    >
      <CardThemed>
        <CardHeader
          title={'TC Build Relic Slots Editor'} // TODO: translation
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Stack spacing={1}>
            {Object.entries(slots).map(
              ([slotKey, { level, statKey, rarity }]) => (
                <SlotEditor
                  key={slotKey}
                  slotKey={slotKey as RelicSlotKey}
                  level={level}
                  statKey={statKey}
                  rarity={rarity}
                  setStatKey={(statKey) =>
                    setSlot(slotKey as RelicSlotKey, { statKey })
                  }
                  setRarity={(rarity) =>
                    setSlot(slotKey as RelicSlotKey, { rarity })
                  }
                  setLevel={(level) =>
                    setSlot(slotKey as RelicSlotKey, { level })
                  }
                />
              )
            )}
          </Stack>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function SlotEditor({
  slotKey,
  level,
  rarity,
  statKey,
  setStatKey,
  setRarity,
  setLevel,
}: {
  slotKey: RelicSlotKey
  level: number
  rarity: RelicRarityKey
  statKey: RelicMainStatKey
  setStatKey: (statKey: RelicMainStatKey) => void
  setRarity: (rarity: RelicRarityKey) => void
  setLevel: (level: number) => void
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <SlotIcon slotKey={slotKey} />
      <RelicRarityDropdown
        rarity={rarity}
        onRarityChange={setRarity}
        showNumber
      />
      <Box sx={{ flexGrow: 1 }}>
        <RelicMainStatDropdown
          dropdownButtonProps={{ fullWidth: true }}
          slotKey={slotKey}
          statKey={statKey}
          setStatKey={setStatKey}
        />
      </Box>
      <NumberInputLazy
        value={level}
        inputProps={{
          sx: { width: '2ch' },
          max: relicMaxLevel[rarity],
          min: 0,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">Level</InputAdornment>
          ),
        }}
        size="small"
        onChange={setLevel}
      />
    </Box>
  )
}
function TCSubsEditor({
  show,
  onClose,
  stats,
  setStat,
}: {
  show: boolean
  onClose: () => void
  type: RelicSubstatTypeKey
  setType: (type: RelicSubstatTypeKey) => void
  stats: Record<RelicSubStatKey, number>
  setStat: (key: RelicSubStatKey, value: number) => void
}) {
  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'sm' }}
    >
      <CardThemed>
        <CardHeader
          title={'TC Build Substats Editor'} // TODO: translation
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Stack spacing={1}>
            {/* TODO: sub type + rarity */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                rowGap: 1,
                columnGap: 2,
              }}
            >
              {Object.entries(stats).map(([statKey, value]) => (
                <TCSubstatEditor
                  key={statKey}
                  statKey={statKey as RelicSubStatKey}
                  value={value}
                  setValue={(value) =>
                    setStat(statKey as RelicSubStatKey, value)
                  }
                />
              ))}
            </Box>
          </Stack>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function TCSubstatEditor({
  statKey,
  value,
  setValue,
}: {
  statKey: RelicSubStatKey
  value: number
  setValue: (v: number) => void
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        justifyContent: 'space-between',
      }}
    >
      <StatDisplay statKey={statKey} />
      <NumberInputLazy
        value={value}
        onChange={setValue}
        float={getUnitStr(statKey) === '%'}
        size="small"
        inputProps={{
          sx: {
            width: '4em',
            textAlign: 'right',
          },
          min: 0,
          max: 9999,
        }}
        InputProps={{
          endAdornment: getUnitStr(statKey) || (
            <Box width="0.8em" component="span" />
          ),
        }}
      />
    </Box>
  )
}
function TCRelicSetEditor({
  show,
  onClose,
  sets,
  setSets,
  removeSet,
}: {
  show: boolean
  onClose: () => void
  sets: Partial<Record<RelicSetKey, 2 | 4>>
  setSets: (setKey: RelicSetKey, count: 2 | 4) => void
  removeSet: (setKey: RelicSetKey) => void
}) {
  const [localSetKey, setLocalSetKey] = useState<RelicSetKey | null>(null)
  const setRelicSetKey = useCallback(
    (setKey: RelicSetKey | '') => {
      if (!setKey) return
      if (isPlanarRelicSetKey(setKey)) {
        setSets(setKey, 2)
      } else if (isCavernRelicSetKey(setKey)) {
        setLocalSetKey(setKey)
      }
    },
    [setSets]
  )
  const setRelicSetCount = useCallback(
    (count: 2 | 4) => {
      if (localSetKey) {
        setSets(localSetKey, count)
        setLocalSetKey(null)
      }
    },
    [localSetKey, setSets]
  )
  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'sm' }}
    >
      <CardThemed>
        <CardHeader
          title={'TC Build Relic Sets Editor'} // TODO: translation
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Stack spacing={1}>
            {Object.entries(sets).map(([setKey, count]) => (
              <Box
                key={setKey}
                sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
              >
                <RelicSetName setKey={setKey as RelicSetKey} />
                <SqBadge>{count}</SqBadge>
                <IconButton
                  size="small"
                  onClick={() => removeSet(setKey as RelicSetKey)}
                >
                  <DeleteForeverIcon />
                </IconButton>
              </Box>
            ))}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <RelicSetAutocomplete
                size="small"
                relicSetKey={localSetKey ?? ''}
                setRelicSetKey={setRelicSetKey}
                sx={{ flexGrow: 1 }}
                label={localSetKey ?? ''}
              />
              <ButtonGroup>
                <Button
                  disabled={!localSetKey}
                  onClick={() => setRelicSetCount(2)}
                >
                  2
                </Button>
                <Button
                  disabled={!localSetKey}
                  onClick={() => setRelicSetCount(4)}
                >
                  4
                </Button>
              </ButtonGroup>
            </Box>
          </Stack>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
