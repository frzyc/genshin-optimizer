import {
  useBoolState,
  useForceUpdate,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  NumberInputLazy,
  useRefSize,
} from '@genshin-optimizer/common/ui'
import type {
  RelicMainStatKey,
  RelicRarityKey,
  RelicSetKey,
  RelicSlotKey,
} from '@genshin-optimizer/sr/consts'
import { allRelicSlotKeys, relicMaxLevel } from '@genshin-optimizer/sr/consts'
import type {
  BuildTCLightCone,
  BuildTcRelicSlot,
  IBuildTc,
} from '@genshin-optimizer/sr/db'
import {
  initCharTC,
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
import { SlotIcon } from '@genshin-optimizer/sr/svgicons'
import {
  COMPACT_ELE_HEIGHT,
  COMPACT_ELE_WIDTH,
  COMPACT_ELE_WIDTH_NUMBER,
  LightConeCardCompact,
  LightConeCardCompactEmpty,
  LightConeCardCompactObj,
  LightConeEditorCard,
  RelicCardCompact,
  RelicMainsCardCompact,
  RelicMainStatDropdown,
  RelicRarityDropdown,
  RelicSetCardCompact,
  RelicSubCard,
} from '@genshin-optimizer/sr/ui'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTeamContext } from './context'
export function BuildsDisplay({ onClose }: { onClose?: () => void }) {
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

  // Calculate how many rows is needed for the layout
  const [rows, setRows] = useState(2)
  const { ref, width } = useRefSize()
  const theme = useTheme()
  useEffect(() => {
    if (!ref.current) return
    const fontSize = parseFloat(window.getComputedStyle(ref.current).fontSize)
    const spacing = parseFloat(theme.spacing(1))
    const eleWidthPx = fontSize * COMPACT_ELE_WIDTH_NUMBER
    const numCols =
      Math.floor((width - eleWidthPx) / (eleWidthPx + spacing)) + 1
    const numRows = Math.ceil(8 / numCols) // 6 relic + set + lc
    setRows(numRows)
  }, [ref, theme, width])
  return (
    <Box
      ref={ref}
      sx={{
        display: 'grid',
        gap: 1,
        boxSizing: 'border-box',
        gridTemplateColumns: `repeat(auto-fit,${COMPACT_ELE_WIDTH})`,
        gridAutoFlow: 'column',
        gridTemplateRows: `repeat(${rows}, ${COMPACT_ELE_HEIGHT})`,
        maxWidth: '100%',
        width: '100%',
        overflex: 'hidden',
      }}
    >
      <LightConeCardCompact bgt="light" lightConeId={lightConeId} />
      <RelicSetCardCompact bgt="light" sets={sets} />
      {allRelicSlotKeys.map((slot) => (
        <RelicCardCompact
          key={slot}
          bgt="light"
          relicId={relicIds[slot]}
          slotKey={slot}
          showLocation
        />
      ))}
    </Box>
  )
}
export function BuildTC({ buildTcId }: { buildTcId: string }) {
  const build = useBuildTc(buildTcId)!
  const { name, description } = build
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
          title={'TC Build Relic Slots Editor'}
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
