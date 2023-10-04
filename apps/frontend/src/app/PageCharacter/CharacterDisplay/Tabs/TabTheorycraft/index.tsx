import type {
  ArtifactRarity,
  ArtifactSetKey,
  ArtifactSlotKey,
  MainStatKey,
  SubstatKey,
  SubstatTypeKey,
  WeaponTypeKey,
} from '@genshin-optimizer/consts'
import {
  allArtifactSlotKeys,
  artMaxLevel,
  artSlotsData,
  substatTypeKeys,
} from '@genshin-optimizer/consts'
import { weaponAsset } from '@genshin-optimizer/gi-assets'
import {
  artDisplayValue,
  getMainStatDisplayValue,
  getSubstatValue,
} from '@genshin-optimizer/gi-util'
import { useBoolState } from '@genshin-optimizer/react-util'
import { iconInlineProps } from '@genshin-optimizer/svgicons'
import { deepClone, objMap } from '@genshin-optimizer/util'
import { CopyAll, DeleteForever, Info, Refresh } from '@mui/icons-material'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import {
  Box,
  Button,
  ButtonGroup,
  CardHeader,
  Divider,
  Grid,
  ListItem,
  MenuItem,
  Skeleton,
  Slider,
  Stack,
  ToggleButton,
  Typography,
} from '@mui/material'
import React, {
  Suspense,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import ArtifactSetAutocomplete from '../../../../Components/Artifact/ArtifactSetAutocomplete'
import ArtifactSetTooltip from '../../../../Components/Artifact/ArtifactSetTooltip'
import SetEffectDisplay from '../../../../Components/Artifact/SetEffectDisplay'
import SlotIcon from '../../../../Components/Artifact/SlotIcon'
import BootstrapTooltip from '../../../../Components/BootstrapTooltip'
import CardDark from '../../../../Components/Card/CardDark'
import CardLight from '../../../../Components/Card/CardLight'
import StatDisplayComponent from '../../../../Components/Character/StatDisplayComponent'
import ColorText from '../../../../Components/ColoredText'
import CustomNumberInput from '../../../../Components/CustomNumberInput'
import DocumentDisplay from '../../../../Components/DocumentDisplay'
import DropdownButton from '../../../../Components/DropdownMenu/DropdownButton'
import {
  FieldDisplayList,
  NodeFieldDisplay,
} from '../../../../Components/FieldDisplay'
import ImgIcon from '../../../../Components/Image/ImgIcon'
import LevelSelect from '../../../../Components/LevelSelect'
import RefinementDropdown from '../../../../Components/RefinementDropdown'
import SolidToggleButtonGroup from '../../../../Components/SolidToggleButtonGroup'
import {
  StatColoredWithUnit,
  StatWithUnit,
} from '../../../../Components/StatDisplay'
import { CharacterContext } from '../../../../Context/CharacterContext'
import type { dataContextObj } from '../../../../Context/DataContext'
import { DataContext } from '../../../../Context/DataContext'
import { getArtSheet } from '../../../../Data/Artifacts'
import Artifact from '../../../../Data/Artifacts/Artifact'
import { artifactDefIcon } from '../../../../Data/Artifacts/ArtifactSheet'
import { getWeaponSheet } from '../../../../Data/Weapons'
import { initCharTC } from '../../../../Database/DataManagers/CharacterTCData'
import { DatabaseContext } from '../../../../Database/Database'
import { uiInput as input } from '../../../../Formula'
import { computeUIData, dataObjForWeapon } from '../../../../Formula/api'
import { constant, percent } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import StatIcon from '../../../../KeyMap/StatIcon'
import useTeamData from '../../../../ReactHooks/useTeamData'
import type { ICachedArtifact } from '../../../../Types/artifact'
import type { ICharTC, ICharTCArtifactSlot } from '../../../../Types/character'
import type { SetNum } from '../../../../Types/consts'
import type { ICachedWeapon } from '../../../../Types/weapon'
import { defaultInitialWeaponKey } from '../../../../Util/WeaponUtil'
import useCharTC from './useCharTC'
const WeaponSelectionModal = React.lazy(
  () => import('../../../../Components/Weapon/WeaponSelectionModal')
)

type ISet = Partial<Record<ArtifactSetKey, 1 | 2 | 4>>
export default function TabTheorycraft() {
  const { database } = useContext(DatabaseContext)
  const { data: oldData } = useContext(DataContext)
  const {
    character,
    character: { key: characterKey, compareData },
    characterSheet,
    characterDispatch,
  } = useContext(CharacterContext)
  const data = useCharTC(
    characterKey,
    defaultInitialWeaponKey(characterSheet.weaponTypeKey)
  )
  const setData = useCallback(
    (data: ICharTC) => database.charTCs.set(characterKey, data),
    [characterKey, database]
  )
  const resetData = useCallback(() => {
    setData(initCharTC(defaultInitialWeaponKey(characterSheet.weaponTypeKey)))
  }, [setData, characterSheet])
  const setWeapon = useCallback(
    (action: Partial<ICharTC['weapon']>) => {
      setData({ ...data, weapon: { ...data.weapon, ...action } })
    },
    [setData, data]
  )

  const copyFrom = useCallback(
    (eWeapon: ICachedWeapon, build: ICachedArtifact[]) => {
      const newData = initCharTC(eWeapon.key)
      newData.artifact.substats.type = data.artifact.substats.type

      newData.weapon.level = eWeapon.level
      newData.weapon.ascension = eWeapon.ascension
      newData.weapon.refinement = eWeapon.refinement

      const sets = {}
      build.forEach((art) => {
        if (!art) return
        const { slotKey, setKey, substats, mainStatKey, level, rarity } = art
        newData.artifact.slots[slotKey].level = level
        newData.artifact.slots[slotKey].statKey = mainStatKey
        newData.artifact.slots[slotKey].rarity = rarity
        sets[setKey] = (sets[setKey] ?? 0) + 1
        substats.forEach((substat) => {
          if (substat.key)
            newData.artifact.substats.stats[substat.key] =
              (newData.artifact.substats.stats[substat.key] ?? 0) +
              substat.accurateValue
        })
      })
      newData.artifact.sets = Object.fromEntries(
        Object.entries(sets)
          .map(([key, value]) => [
            key,
            value === 3
              ? 2
              : value === 5
              ? 4
              : value === 1 && !(key as string).startsWith('PrayersFor')
              ? 0
              : value,
          ])
          .filter(([, value]) => value)
      )
      setData(newData)
    },
    [data, setData]
  )
  const location = useLocation()
  const { build: locBuild } = (location.state as
    | { build: string[] }
    | undefined) ?? { build: undefined }
  useEffect(() => {
    if (!locBuild) return
    const eWeapon = database.weapons.get(character.equippedWeapon)!
    copyFrom(
      eWeapon,
      locBuild.map((i) => database.arts.get(i)!)
    )
    // WARNING: if copyFrom is included, it will cause a render loop due to its setData <---> data
    // eslint-disable-next-line
  }, [locBuild, database])

  const copyFromEquipped = useCallback(() => {
    const eWeapon = database.weapons.get(character.equippedWeapon)!
    copyFrom(
      eWeapon,
      Object.values(character.equippedArtifacts)
        .map((a) => database.arts.get(a)!)
        .filter((a) => a)
    )
  }, [
    database,
    character.equippedArtifacts,
    character.equippedWeapon,
    copyFrom,
  ])

  const weapon: ICachedWeapon = useMemo(() => {
    return {
      ...data.weapon,
      location: '',
      lock: false,
      id: '',
    }
  }, [data])
  const setArtifact = useCallback(
    (artifact: ICharTC['artifact']) => {
      const data_ = deepClone(data)
      data_.artifact = artifact
      setData(data_)
    },
    [data, setData]
  )

  const setSubstatsType = useCallback(
    (t: SubstatTypeKey) => {
      const data_ = deepClone(data)
      data_.artifact.substats.type = t
      setData(data_)
    },
    [data, setData]
  )

  const setSubstats = useCallback(
    (setSubstats: Record<SubstatKey, number>) => {
      const data_ = deepClone(data)
      data_.artifact.substats.stats = setSubstats
      setData(data_)
    },
    [data, setData]
  )

  const deferredData = useDeferredValue(data)
  const overriderArtData = useMemo(() => {
    const stats = { ...deferredData.artifact.substats.stats }
    Object.values(deferredData.artifact.slots).forEach(
      ({ statKey, rarity, level }) =>
        (stats[statKey] =
          (stats[statKey] ?? 0) +
          getMainStatDisplayValue(statKey, rarity, level))
    )
    return {
      art: objMap(stats, (v, k) =>
        k.endsWith('_') ? percent(v / 100) : constant(v)
      ),
      artSet: objMap(deferredData.artifact.sets, (v) => constant(v)),
    }
  }, [deferredData])

  const overrideWeapon: ICachedWeapon = useMemo(
    () => ({
      id: '',
      location: '',
      key: data.weapon.key,
      level: data.weapon.level,
      ascension: data.weapon.ascension,
      refinement: data.weapon.refinement,
      lock: false,
    }),
    [data]
  )
  const teamData = useTeamData(
    characterKey,
    0,
    overriderArtData,
    overrideWeapon
  )

  const { target: charUIData } = teamData?.[characterKey] ?? {}

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
    }
  }, [charUIData, teamData])
  const dataContextValueWithOld: dataContextObj | undefined = useMemo(() => {
    if (!dataContextValue) return undefined
    return {
      ...dataContextValue,
      oldData: compareData ? oldData : undefined,
    }
  }, [dataContextValue, compareData, oldData])
  return (
    <Stack spacing={1}>
      <CardLight>
        <Box sx={{ display: 'flex', gap: 1, p: 1 }}>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <Button
              color="info"
              onClick={copyFromEquipped}
              startIcon={<CopyAll />}
            >
              Copy from equipped
            </Button>
            <Button color="error" onClick={resetData} startIcon={<Refresh />}>
              Reset
            </Button>
          </Box>
          <SolidToggleButtonGroup
            exclusive
            value={compareData}
            onChange={(e, v) => characterDispatch({ compareData: v })}
            size="small"
          >
            <ToggleButton value={false} disabled={!compareData}>
              Show TC stats
            </ToggleButton>
            <ToggleButton value={true} disabled={compareData}>
              Compare vs. equipped
            </ToggleButton>
          </SolidToggleButtonGroup>
        </Box>
      </CardLight>
      {dataContextValue ? (
        <DataContext.Provider value={dataContextValue}>
          <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
            <Grid item sx={{ flexGrow: -1 }}>
              <WeaponEditorCard
                weapon={weapon}
                setWeapon={setWeapon}
                weaponTypeKey={characterSheet.weaponTypeKey}
              />
              <ArtifactMainLevelCard
                artifactData={data.artifact}
                setArtifactData={setArtifact}
              />
            </Grid>
            <Grid item sx={{ flexGrow: 1 }}>
              <ArtifactSubCard
                substats={data.artifact.substats.stats}
                setSubstats={setSubstats}
                substatsType={data.artifact.substats.type}
                setSubstatsType={setSubstatsType}
                mainStatKeys={Object.values(data.artifact.slots).map(
                  (s) => s.statKey
                )}
              />
            </Grid>
          </Grid>
        </DataContext.Provider>
      ) : (
        <Skeleton variant="rectangular" width="100%" height={500} />
      )}
      <CardLight sx={{ flexGrow: 1, p: 1 }}>
        {dataContextValueWithOld ? (
          <DataContext.Provider value={dataContextValueWithOld}>
            <StatDisplayComponent />
          </DataContext.Provider>
        ) : (
          <Skeleton variant="rectangular" width="100%" height={500} />
        )}
      </CardLight>
    </Stack>
  )
}

function WeaponEditorCard({
  weapon,
  setWeapon,
  weaponTypeKey,
}: {
  weapon: ICachedWeapon
  weaponTypeKey: WeaponTypeKey
  setWeapon: (action: Partial<ICharTC['weapon']>) => void
}) {
  const { key, level = 0, refinement = 1, ascension = 0 } = weapon
  const weaponSheet = getWeaponSheet(key)
  const [show, onShow, onHide] = useBoolState()
  const { data } = useContext(DataContext)
  const weaponUIData = useMemo(
    () => weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]),
    [weaponSheet, weapon]
  )
  return (
    <CardLight sx={{ p: 1, mb: 1 }}>
      <WeaponSelectionModal
        ascension={ascension}
        show={show}
        onHide={onHide}
        onSelect={(k) => setWeapon({ key: k })}
        weaponTypeFilter={weaponTypeKey}
      />
      <Box display="flex" flexDirection="column" gap={1}>
        <Box display="flex" gap={1}>
          <Box
            className={`grad-${weaponSheet.rarity}star`}
            component="img"
            src={weaponAsset(weapon.key, ascension >= 2)}
            sx={{
              flexshrink: 1,
              flexBasis: 0,
              maxWidth: '30%',
              borderRadius: 1,
            }}
          />
          <Stack spacing={1} flexGrow={1}>
            <Button
              fullWidth
              color="info"
              sx={{ flexGrow: 1 }}
              onClick={onShow}
            >
              <Box sx={{ maxWidth: '10em' }}>{weaponSheet?.name}</Box>
            </Button>
            {weaponSheet.hasRefinement && (
              <RefinementDropdown
                refinement={refinement}
                setRefinement={(r) => setWeapon({ refinement: r })}
              />
            )}
          </Stack>
        </Box>
        <LevelSelect
          level={level}
          ascension={ascension}
          setBoth={setWeapon}
          useLow={!weaponSheet.hasRefinement}
        />
        <CardDark>
          <CardHeader
            title={'Main Stats'}
            titleTypographyProps={{ variant: 'subtitle2' }}
          />
          <Divider />
          {weaponUIData && (
            <FieldDisplayList>
              {[input.weapon.main, input.weapon.sub, input.weapon.sub2].map(
                (node) => {
                  const n = weaponUIData.get(node)
                  if (n.isEmpty || !n.value) return null
                  return (
                    <NodeFieldDisplay
                      key={JSON.stringify(n.info)}
                      node={n}
                      component={ListItem}
                    />
                  )
                }
              )}
            </FieldDisplayList>
          )}
        </CardDark>
        {data && weaponSheet?.document && (
          <DocumentDisplay sections={weaponSheet.document} />
        )}
      </Box>
    </CardLight>
  )
}

function ArtifactMainLevelCard({
  artifactData,
  setArtifactData,
}: {
  artifactData: ICharTC['artifact']
  setArtifactData: (a: ICharTC['artifact']) => void
}) {
  const setSlot = useCallback(
    (slotKey: ArtifactSlotKey) => (slot: ICharTCArtifactSlot) => {
      const artifactData_ = deepClone(artifactData)
      artifactData_.slots[slotKey] = slot
      setArtifactData(artifactData_)
    },
    [artifactData, setArtifactData]
  )

  const setArtSet = useCallback(
    (artSet: ISet) => {
      const artifactData_ = deepClone(artifactData)
      artifactData_.sets = artSet
      setArtifactData(artifactData_)
    },
    [artifactData, setArtifactData]
  )

  return (
    <Stack spacing={1}>
      <CardLight sx={{ p: 1 }}>
        <Stack spacing={1}>
          {allArtifactSlotKeys.map((s) => (
            <ArtifactMainLevelSlot
              key={s}
              slotKey={s}
              slot={artifactData.slots[s]}
              setSlot={setSlot(s)}
            />
          ))}
        </Stack>
      </CardLight>
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={200} />}
      >
        <ArtifactSetsEditor artSet={artifactData.sets} setArtSet={setArtSet} />
      </Suspense>
    </Stack>
  )
}
function ArtifactMainLevelSlot({
  slotKey,
  slot,
  setSlot: setSlotProp,
}: {
  slotKey: ArtifactSlotKey
  slot: ICharTCArtifactSlot
  setSlot: (s: ICharTCArtifactSlot) => void
}) {
  const { level, statKey, rarity } = slot
  const keys = artSlotsData[slotKey].stats
  const setSlot = useCallback(
    (action: Partial<ICharTCArtifactSlot>) => {
      setSlotProp({ ...slot, ...action })
    },
    [slot, setSlotProp]
  )
  const setRarity = useCallback(
    (r: ArtifactRarity) => {
      const mLvl = artMaxLevel[r] ?? 0
      if (level > mLvl) setSlot({ rarity: r, level: mLvl })
      else setSlot({ rarity: r })
    },
    [level, setSlot]
  )

  return (
    <Box
      display="flex"
      gap={1}
      justifyContent="space-between"
      alignItems="center"
    >
      <SlotIcon slotKey={slotKey} />
      <CardDark
        sx={{ height: '100%', minWidth: '5em', flexGrow: 1, display: 'flex' }}
      >
        {keys.length === 1 ? (
          <Box
            p={1}
            justifyContent="center"
            alignItems="center"
            width="100%"
            display="flex"
            gap={1}
          >
            <StatIcon statKey={keys[0]} iconProps={iconInlineProps} />{' '}
            {KeyMap.getStr(keys[0])}
          </Box>
        ) : (
          <DropdownButton
            sx={{ px: 0 }}
            fullWidth
            title={<StatWithUnit statKey={statKey} />}
            color={KeyMap.getVariant(statKey) ?? 'success'}
          >
            {keys.map((msk) => (
              <MenuItem
                key={msk}
                disabled={statKey === msk}
                onClick={() => setSlot({ statKey: msk })}
              >
                <StatColoredWithUnit statKey={msk} />
              </MenuItem>
            ))}
          </DropdownButton>
        )}
      </CardDark>
      <DropdownButton
        sx={{ px: 0 }}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {rarity} <StarRoundedIcon fontSize="inherit" />
          </Box>
        }
      >
        {[5, 4, 3].map((r) => (
          <MenuItem
            key={r}
            disabled={rarity === r}
            onClick={() => setRarity(r as ArtifactRarity)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {r} <StarRoundedIcon fontSize="inherit" />
            </Box>
          </MenuItem>
        ))}
      </DropdownButton>
      <CustomNumberInput
        startAdornment="+"
        value={level}
        color={Artifact.levelVariant(level)}
        onChange={(l) => l !== undefined && setSlot({ level: l })}
        sx={{ borderRadius: 1, pl: 1, my: 0, height: '100%' }}
        inputProps={{ sx: { pl: 0.5, width: '2em' }, max: 20, min: 0 }}
      />
      <CardDark sx={{ height: '100%', minWidth: '4em' }}>
        <Box p={1} textAlign="center">{`${artDisplayValue(
          getMainStatDisplayValue(statKey, rarity, level),
          KeyMap.unit(statKey)
        )}${KeyMap.unit(statKey)}`}</Box>
      </CardDark>
    </Box>
  )
}

function ArtifactSetsEditor({
  artSet,
  setArtSet,
}: {
  artSet: ISet
  setArtSet(artSet: ISet)
}) {
  const setSet = useCallback(
    (setKey: ArtifactSetKey | '') => {
      if (!setKey) return
      setArtSet({
        ...artSet,
        [setKey]: parseInt(Object.keys(getArtSheet(setKey).setEffects)[0]),
      })
    },
    [artSet, setArtSet]
  )

  const setValue = useCallback(
    (setKey: ArtifactSetKey) => (value: 1 | 2 | 4) =>
      setArtSet({ ...artSet, [setKey]: value }),
    [artSet, setArtSet]
  )
  const deleteValue = useCallback(
    (setKey: ArtifactSetKey) => () => {
      const { [setKey]: _, ...rest } = artSet
      setArtSet({ ...rest })
    },
    [artSet, setArtSet]
  )

  const remaining = 5 - Object.values(artSet).reduce((a, b) => a + b, 0)

  return (
    <Stack spacing={1} sx={{ flexGrow: 1 }}>
      {Object.entries(artSet).map(([setKey, value]) => (
        <ArtifactSetEditor
          key={setKey}
          setKey={setKey}
          value={value}
          setValue={setValue(setKey)}
          deleteValue={deleteValue(setKey)}
          remaining={remaining}
        />
      ))}
      <CardLight sx={{ flexGrow: 1, overflow: 'visible' }}>
        <ArtifactSetAutocomplete
          artSetKey={''}
          setArtSetKey={setSet}
          label={'New Artifact Set'}
          getOptionDisabled={({ key }) =>
            Object.keys(artSet).includes(key as ArtifactSetKey) ||
            !key ||
            Object.keys(getArtSheet(key).setEffects).every(
              (n) => parseInt(n) > remaining
            )
          }
        />
      </CardLight>
    </Stack>
  )
}
function ArtifactSetEditor({
  setKey,
  value,
  setValue,
  deleteValue,
  remaining,
}: {
  setKey: ArtifactSetKey
  value: 1 | 2 | 4
  setValue: (v: 1 | 2 | 4) => void
  deleteValue: () => void
  remaining: number
}) {
  const artifactSheet = getArtSheet(setKey)

  /* Assumes that all conditionals are from 4-Set. needs to change if there are 2-Set conditionals */
  const set4CondNums = useMemo(() => {
    if (value < 4) return []
    return Object.keys(artifactSheet.setEffects).filter((setNumKey) =>
      artifactSheet.setEffects[setNumKey]?.document.some(
        (doc) => 'states' in doc
      )
    )
  }, [artifactSheet, value])

  return (
    <CardLight>
      <Box display="flex">
        <ArtifactSetTooltip artifactSheet={artifactSheet} numInSet={value}>
          <Box flexGrow={1} p={1} display="flex" gap={1} alignItems="center">
            <ImgIcon size={2} src={artifactDefIcon(setKey)} />
            <Box>{artifactSheet.setName}</Box>
            <Info />
          </Box>
        </ArtifactSetTooltip>
        <ButtonGroup>
          <DropdownButton
            size="small"
            title={<Box whiteSpace="nowrap">{value}-set</Box>}
          >
            {Object.keys(artifactSheet.setEffects)
              .map((setKey) => parseInt(setKey))
              .map((setKey) => (
                <MenuItem
                  key={setKey}
                  disabled={value === setKey || setKey > remaining + value}
                  onClick={() => setValue(setKey as 1 | 2 | 4)}
                >
                  {setKey}-set
                </MenuItem>
              ))}
          </DropdownButton>
          <Button color="error" size="small" onClick={deleteValue}>
            <DeleteForever />
          </Button>
        </ButtonGroup>
      </Box>
      {!!set4CondNums.length && (
        <Stack spacing={1} sx={{ p: 1 }}>
          {set4CondNums.map((setNumKey) => (
            <SetEffectDisplay
              key={setNumKey}
              setKey={setKey}
              setNumKey={parseInt(setNumKey) as SetNum}
              hideHeader
              conditionalsOnly
            />
          ))}
        </Stack>
      )}
    </CardLight>
  )
}
function ArtifactSubCard({
  substats,
  setSubstats,
  substatsType,
  setSubstatsType,
  mainStatKeys,
}: {
  substats: Record<SubstatKey, number>
  setSubstats: (substats: Record<SubstatKey, number>) => void
  substatsType: SubstatTypeKey
  setSubstatsType: (t: SubstatTypeKey) => void
  mainStatKeys: MainStatKey[]
}) {
  const setValue = useCallback(
    (key: SubstatKey) => (v: number) => setSubstats({ ...substats, [key]: v }),
    [substats, setSubstats]
  )
  const { t } = useTranslation('page_character')
  const rv =
    Object.entries(substats).reduce(
      (t, [k, v]) => t + v / getSubstatValue(k),
      0
    ) * 100
  const rolls = Object.entries(substats).reduce(
    (t, [k, v]) => t + v / getSubstatValue(k, undefined, substatsType),
    0
  )
  return (
    <CardLight sx={{ p: 1, height: '100%' }}>
      <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
        <DropdownButton
          fullWidth
          title={t(`tabTheorycraft.substatType.${substatsType}`)}
        >
          {substatTypeKeys.map((st) => (
            <MenuItem
              key={st}
              disabled={substatsType === st}
              onClick={() => setSubstatsType(st)}
            >
              {t(`tabTheorycraft.substatType.${st}`)}
            </MenuItem>
          ))}
        </DropdownButton>
        <BootstrapTooltip
          title={<Typography>{t`tabTheorycraft.maxTotalRolls`}</Typography>}
          placement="top"
        >
          <CardDark
            sx={{
              textAlign: 'center',
              py: 0.5,
              px: 1,
              minWidth: '15em',
              whiteSpace: 'nowrap',
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <ColorText color={rolls > 45 ? 'warning' : undefined}>
              Rolls: <strong>{rolls.toFixed(0)}</strong>
            </ColorText>
            <ColorText color={rolls > 45 ? 'warning' : undefined}>
              RV: <strong>{rv.toFixed(1)}%</strong>
            </ColorText>
          </CardDark>
        </BootstrapTooltip>
      </Box>
      <Stack spacing={1}>
        {Object.entries(substats).map(([k, v]) => (
          <ArtifactSubstatEditor
            key={k}
            statKey={k}
            value={v}
            setValue={setValue(k)}
            substatsType={substatsType}
            mainStatKeys={mainStatKeys}
          />
        ))}
      </Stack>
    </CardLight>
  )
}
function ArtifactSubstatEditor({
  statKey,
  value,
  setValue,
  substatsType,
  mainStatKeys,
}: {
  statKey: SubstatKey
  value: number
  setValue: (v: number) => void
  substatsType: SubstatTypeKey
  mainStatKeys: MainStatKey[]
}) {
  const { t } = useTranslation('page_character')
  const substatValue = getSubstatValue(statKey, 5, substatsType)
  const [rolls, setRolls] = useState(() => value / substatValue)
  useEffect(() => setRolls(value / substatValue), [value, substatValue])

  const unit = KeyMap.unit(statKey)
  const displayValue = rolls * substatValue

  const rv = ((rolls * substatValue) / getSubstatValue(statKey)) * 100
  const numMains = mainStatKeys.reduce(
    (t, ms) => t + (ms === statKey ? 1 : 0),
    0
  )
  const maxRolls = (5 - numMains) * 6
  // 0.0001 to nudge float comparasion
  const invalid = rolls - 0.0001 > maxRolls
  const setRValue = useCallback(
    (r: number) => setValue(r * substatValue),
    [setValue, substatValue]
  )

  return (
    <Stack spacing={0.5}>
      <Box
        display="flex"
        gap={1}
        justifyContent="space-between"
        alignItems="center"
      >
        <CardDark
          sx={{
            p: 0.5,
            minWidth: '11em',
            flexGrow: 1,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StatIcon statKey={statKey} iconProps={{ fontSize: 'inherit' }} />
          {KeyMap.getStr(statKey)}
          {KeyMap.unit(statKey)}
        </CardDark>
        <BootstrapTooltip
          title={
            <Typography>
              {t(
                numMains
                  ? `tabTheorycraft.maxRollsMain`
                  : `tabTheorycraft.maxRolls`,
                { value: maxRolls }
              )}
            </Typography>
          }
          placement="top"
        >
          <CardDark sx={{ textAlign: 'center', p: 0.5, minWidth: '8em' }}>
            <ColorText color={invalid ? 'warning' : undefined}>
              RV: <strong>{rv.toFixed(1)}%</strong>
            </ColorText>
          </CardDark>
        </BootstrapTooltip>
      </Box>
      <Box
        display="flex"
        gap={1}
        justifyContent="space-between"
        alignItems="center"
      >
        <CustomNumberInput
          color={displayValue ? 'success' : 'primary'}
          float={KeyMap.unit(statKey) === '%'}
          endAdornment={
            KeyMap.unit(statKey) || <Box width="1em" component="span" />
          }
          value={parseFloat(displayValue.toFixed(2))}
          onChange={(v) => v !== undefined && setValue(v)}
          sx={{ borderRadius: 1, px: 1, height: '100%', width: '6em' }}
          inputProps={{ sx: { textAlign: 'right' }, min: 0 }}
        />
        <CardDark
          sx={{
            px: 2,
            flexGrow: 1,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
          }}
        >
          <Slider
            size="small"
            value={rolls}
            max={maxRolls}
            min={0}
            step={1}
            marks
            valueLabelDisplay="auto"
            onChange={(e, v) => setRolls(v as number)}
            onChangeCommitted={(e, v) => setRValue(v as number)}
          />
        </CardDark>
        <CustomNumberInput
          color={value ? (invalid ? 'warning' : 'success') : 'primary'}
          float
          startAdornment={
            <Box
              sx={{
                whiteSpace: 'nowrap',
                width: '7em',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>
                {artDisplayValue(substatValue, unit)}
                {unit}
              </span>
              <span>x</span>
            </Box>
          }
          value={parseFloat(rolls.toFixed(2))}
          onChange={(v) => v !== undefined && setValue(v * substatValue)}
          sx={{ borderRadius: 1, px: 1, my: 0, height: '100%', width: '7em' }}
          inputProps={{ sx: { textAlign: 'right', pr: 0.5 }, min: 0, step: 1 }}
        />
      </Box>
    </Stack>
  )
}
