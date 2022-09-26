import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CopyAll, DeleteForever, Info, Refresh } from "@mui/icons-material";
import { Box, Button, ButtonGroup, CardHeader, Divider, Grid, ListItem, MenuItem, Skeleton, Stack, ToggleButton, Typography } from "@mui/material";
import { WeaponTypeKey } from "pipeline";
import { useCallback, useContext, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { ArtifactSetSingleAutocomplete } from "../../../../Components/Artifact/ArtifactAutocomplete";
import ArtifactSetTooltip from "../../../../Components/Artifact/ArtifactSetTooltip";
import SetEffectDisplay from "../../../../Components/Artifact/SetEffectDisplay";
import { slotIconSVG } from "../../../../Components/Artifact/SlotNameWIthIcon";
import BootstrapTooltip from "../../../../Components/BootstrapTooltip";
import CardDark from "../../../../Components/Card/CardDark";
import CardLight from "../../../../Components/Card/CardLight";
import StatDisplayComponent from "../../../../Components/Character/StatDisplayComponent";
import ColorText from "../../../../Components/ColoredText";
import CustomNumberInput from "../../../../Components/CustomNumberInput";
import DocumentDisplay from "../../../../Components/DocumentDisplay";
import DropdownButton from "../../../../Components/DropdownMenu/DropdownButton";
import { FieldDisplayList, NodeFieldDisplay } from "../../../../Components/FieldDisplay";
import FontAwesomeSvgIcon from "../../../../Components/FontAwesomeSvgIcon";
import ImgIcon from "../../../../Components/Image/ImgIcon";
import LevelSelect from "../../../../Components/LevelSelect";
import RefinementDropdown from "../../../../Components/RefinementDropdown";
import SolidToggleButtonGroup from "../../../../Components/SolidToggleButtonGroup";
import { StatColoredWithUnit, StatWithUnit } from "../../../../Components/StatDisplay";
import StatIcon from "../../../../Components/StatIcon";
import WeaponSelectionModal from "../../../../Components/Weapon/WeaponSelectionModal";
import { CharacterContext } from "../../../../Context/CharacterContext";
import { DataContext, dataContextObj } from "../../../../Context/DataContext";
import Artifact, { maxArtifactLevel } from "../../../../Data/Artifacts/Artifact";
import { ArtifactSheet } from "../../../../Data/Artifacts/ArtifactSheet";
import WeaponSheet from "../../../../Data/Weapons/WeaponSheet";
import { initCharTC } from "../../../../Database/DataManagers/CharacterTCData";
import { DatabaseContext } from "../../../../Database/Database";
import { uiInput as input } from "../../../../Formula";
import { computeUIData, dataObjForWeapon } from "../../../../Formula/api";
import { constant, percent } from "../../../../Formula/utils";
import KeyMap, { cacheValueString } from "../../../../KeyMap";
import useBoolState from "../../../../ReactHooks/useBoolState";
import usePromise from "../../../../ReactHooks/usePromise";
import useTeamData from "../../../../ReactHooks/useTeamData";
import { ICachedArtifact, MainStatKey, SubstatKey } from "../../../../Types/artifact";
import { ICharTC, ICharTCArtifactSlot } from "../../../../Types/character";
import { allSlotKeys, ArtifactRarity, ArtifactSetKey, SetNum, SlotKey, SubstatType, substatType } from "../../../../Types/consts";
import { ICachedWeapon } from "../../../../Types/weapon";
import { deepClone, objectMap } from "../../../../Util/Util";
import { defaultInitialWeaponKey } from "../../../../Util/WeaponUtil";
import useCharTC from "./useCharTC";

type ISet = Partial<Record<ArtifactSetKey, 1 | 2 | 4>>
export default function TabTheorycraft() {
  const { database } = useContext(DatabaseContext)
  const { data: oldData } = useContext(DataContext)
  const { character, character: { key: characterKey, compareData }, characterSheet, characterDispatch } = useContext(CharacterContext)
  const data = useCharTC(characterKey, defaultInitialWeaponKey(characterSheet.weaponTypeKey))
  const setData = useCallback((data: ICharTC) => database.charTCs.set(characterKey, data), [characterKey, database])
  const resetData = useCallback(() => {
    setData(initCharTC(defaultInitialWeaponKey(characterSheet.weaponTypeKey)))
  }, [setData, characterSheet])
  const setWeapon = useCallback(
    (action: Partial<ICharTC["weapon"]>) => {
      setData({ ...data, weapon: { ...data.weapon, ...action } })
    },
    [setData, data],
  )

  const copyFrom = useCallback(
    (eWeapon: ICachedWeapon, build: ICachedArtifact[]) => {
      const newData = initCharTC(eWeapon.key)
      newData.artifact.substats.type = data.artifact.substats.type

      newData.weapon.level = eWeapon.level
      newData.weapon.ascension = eWeapon.ascension
      newData.weapon.refinement = eWeapon.refinement

      const sets = {}
      build.forEach(art => {
        if (!art) return
        const { slotKey, setKey, substats, mainStatKey, level, rarity } = art
        newData.artifact.slots[slotKey].level = level
        newData.artifact.slots[slotKey].statKey = mainStatKey
        newData.artifact.slots[slotKey].rarity = rarity
        sets[setKey] = (sets[setKey] ?? 0) + 1
        substats.forEach(substat => {
          if (substat.key) newData.artifact.substats.stats[substat.key] = (newData.artifact.substats.stats[substat.key] ?? 0) + substat.accurateValue
        })
      })
      newData.artifact.sets = Object.fromEntries(Object.entries(sets).map(([key, value]) => [key,
        value === 3 ? 2 :
          value === 5 ? 4 :
            value === 1 && !(key as string).startsWith("PrayersFor") ? 0 : value
      ]).filter(([key, value]) => value))
      setData(newData)
    },
    [data, setData],
  )

  const location = useLocation()
  const { build: locBuild } = (location.state as { build: ICachedArtifact[] } | undefined) ?? { build: undefined }
  useEffect(() => {
    if (!locBuild) return
    const eWeapon = database.weapons.get(character.equippedWeapon)!
    copyFrom(eWeapon, locBuild)
  }, [database, locBuild, character.equippedWeapon, copyFrom])

  const copyFromEquipped = useCallback(
    () => {
      const eWeapon = database.weapons.get(character.equippedWeapon)!
      copyFrom(eWeapon, Object.values(character.equippedArtifacts).map(a => database.arts.get(a)!).filter(a => a))
    },
    [database, character.equippedArtifacts, character.equippedWeapon, copyFrom],
  )

  const weapon: ICachedWeapon = useMemo(() => {
    return {
      ...data.weapon,
      location: "",
      lock: false,
      id: ""
    }
  }, [data])
  const setArtifact = useCallback((artifact: ICharTC["artifact"]) => {
    const data_ = deepClone(data)
    data_.artifact = artifact
    setData(data_)
  }, [data, setData])

  const setSubstatsType = useCallback((t: SubstatType) => {
    const data_ = deepClone(data)
    data_.artifact.substats.type = t
    setData(data_)
  }, [data, setData])

  const setSubstats = useCallback((setSubstats: Record<SubstatKey, number>) => {
    const data_ = deepClone(data)
    data_.artifact.substats.stats = setSubstats
    setData(data_)
  }, [data, setData])

  const overriderArtData = useMemo(() => {
    const stats = { ...data.artifact.substats.stats }
    Object.values(data.artifact.slots).forEach(({ statKey, rarity, level }) =>
      stats[statKey] = (stats[statKey] ?? 0) + Artifact.mainStatValue(statKey, rarity, level))
    return {
      art: objectMap(stats, (v, k) => k.endsWith("_") ? percent(v / 100) : constant(v)),
      artSet: objectMap(data.artifact.sets, v => constant(v)),
    }
  }, [data])

  const overrideWeapon: ICachedWeapon = useMemo(() => ({
    id: "",
    location: "",
    key: data.weapon.key,
    level: data.weapon.level,
    ascension: data.weapon.ascension,
    refinement: data.weapon.refinement,
    lock: false
  }), [data])
  const teamData = useTeamData(characterKey, 0, overriderArtData, overrideWeapon)

  const { target: charUIData } = teamData?.[characterKey] ?? {}

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
      oldData: compareData ? oldData : undefined,
    }
  }, [charUIData, teamData, compareData, oldData])

  return <Stack spacing={1}>
    {dataContextValue ? <DataContext.Provider value={dataContextValue}>
      <Box>
        <CardLight>
          <Box sx={{ display: "flex", gap: 1, p: 1 }}>
            <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
              <Button color="info" onClick={copyFromEquipped} startIcon={<CopyAll />}>Copy from equipped</Button>
              <Button color="error" onClick={resetData} startIcon={<Refresh />}>Reset</Button>
            </Box>
            <SolidToggleButtonGroup exclusive value={compareData} onChange={(e, v) => characterDispatch({ compareData: v })} size="small">
              <ToggleButton value={false} disabled={!compareData}>Show TC stats</ToggleButton>
              <ToggleButton value={true} disabled={compareData}>Compare vs. equipped</ToggleButton>
            </SolidToggleButtonGroup>
          </Box>
        </CardLight>
      </Box>
      <Box>
        <Grid container spacing={1} sx={{ justifyContent: "center" }} columns={4}>
          <Grid item sx={{ flexGrow: -1 }}  >
            <WeaponEditorCard weapon={weapon} setWeapon={setWeapon} weaponTypeKey={characterSheet.weaponTypeKey} />
          </Grid>
          <Grid item sx={{ flexGrow: 1 }}  >
            <ArtifactMainLevelCard artifactData={data.artifact} setArtifactData={setArtifact} />
          </Grid>
          <Grid item sx={{ flexGrow: 1 }}  >
            <ArtifactSubCard substats={data.artifact.substats.stats} setSubstats={setSubstats} substatsType={data.artifact.substats.type} setSubstatsType={setSubstatsType} mainStatKeys={Object.values(data.artifact.slots).map(s => s.statKey)} />
          </Grid>
        </Grid >
      </Box>
      <CardLight sx={{ flexGrow: 1, p: 1 }}>
        <StatDisplayComponent />
      </CardLight>
    </DataContext.Provider> : <Skeleton variant='rectangular' width='100%' height={1000} />}
  </Stack>
}

function WeaponEditorCard({ weapon, setWeapon, weaponTypeKey }: { weapon: ICachedWeapon, weaponTypeKey: WeaponTypeKey, setWeapon: (action: Partial<ICharTC["weapon"]>) => void }) {
  const { key, level = 0, refinement = 1, ascension = 0 } = weapon
  const weaponSheet = usePromise(() => WeaponSheet.get(key), [key])
  const [show, onShow, onHide] = useBoolState()
  const { data } = useContext(DataContext)
  const weaponUIData = useMemo(() => weaponSheet && weapon && computeUIData([weaponSheet.data, dataObjForWeapon(weapon)]), [weaponSheet, weapon])
  return <CardLight sx={{ p: 1, height: "100%" }} >
    <WeaponSelectionModal ascension={ascension} show={show} onHide={onHide} onSelect={k => setWeapon({ key: k })} weaponTypeFilter={weaponTypeKey} />
    <Box display="flex" flexDirection="column" gap={1}>
      <Box display="flex" gap={1}>
        {weaponSheet && <Box
          className={`grad-${weaponSheet.rarity}star`}
          component="img"
          src={weaponSheet.getImg(weapon.ascension)}
          sx={{ flexshrink: 1, flexBasis: 0, maxWidth: "30%", borderRadius: 1 }}
        />}
        <Stack spacing={1} flexGrow={1}>
          <Button fullWidth color="info" sx={{ flexGrow: 1 }} onClick={onShow}><Box sx={{ maxWidth: "10em" }}>{weaponSheet?.name}</Box></Button>
          {weaponSheet?.hasRefinement && <RefinementDropdown refinement={refinement} setRefinement={r => setWeapon({ refinement: r })} />}
        </Stack>
      </Box>
      {weaponSheet && <LevelSelect level={level} ascension={ascension} setBoth={setWeapon} useLow={!weaponSheet.hasRefinement} />}
      <CardDark >
        <CardHeader title={"Main Stats"} titleTypographyProps={{ variant: "subtitle2" }} />
        <Divider />
        {weaponUIData && <FieldDisplayList>
          {[input.weapon.main, input.weapon.sub, input.weapon.sub2].map((node, i) => {
            const n = weaponUIData.get(node)
            if (n.isEmpty || !n.value) return null
            return <NodeFieldDisplay key={n.info.key} node={n} component={ListItem} />
          })}
        </FieldDisplayList>}
      </CardDark>
      {data && weaponSheet?.document && <DocumentDisplay sections={weaponSheet.document} />}
    </Box>
  </CardLight >
}

function ArtifactMainLevelCard({ artifactData, setArtifactData }:
  { artifactData: ICharTC["artifact"], setArtifactData: (a: ICharTC["artifact"]) => void }) {
  const setSlot = useCallback((slotKey: SlotKey) => (slot: ICharTCArtifactSlot) => {
    const artifactData_ = deepClone(artifactData)
    artifactData_.slots[slotKey] = slot
    setArtifactData(artifactData_)
  }, [artifactData, setArtifactData])

  const setArtSet = useCallback((artSet: ISet) => {
    const artifactData_ = deepClone(artifactData)
    artifactData_.sets = artSet
    setArtifactData(artifactData_)
  }, [artifactData, setArtifactData])

  return <Stack spacing={1} sx={{ height: "100%" }}>
    <CardLight sx={{ p: 1 }}>
      <Stack spacing={1}>
        {allSlotKeys.map(s => <ArtifactMainLevelSlot key={s} slotKey={s} slot={artifactData.slots[s]} setSlot={setSlot(s)} />)}
      </Stack>
    </CardLight>
    <ArtifactSetsEditor artSet={artifactData.sets} setArtSet={setArtSet} />
  </Stack>
}
function ArtifactMainLevelSlot({ slotKey, slot, setSlot: setSlotProp }: { slotKey: SlotKey, slot: ICharTCArtifactSlot, setSlot: (s: ICharTCArtifactSlot) => void }) {
  const { level, statKey, rarity } = slot
  const keys = Artifact.slotMainStats(slotKey)
  const setSlot = useCallback((action: Partial<ICharTCArtifactSlot>) => {
    setSlotProp({ ...slot, ...action })
  }, [slot, setSlotProp])
  const setRarity = useCallback(
    (r: ArtifactRarity) => {
      const mLvl = maxArtifactLevel[r] ?? 0
      if (level > mLvl) setSlot({ rarity: r, level: mLvl })
      else setSlot({ rarity: r })
    }, [level, setSlot])

  return <Box display="flex" gap={1} justifyContent="space-between" alignItems="center">
    <FontAwesomeSvgIcon icon={slotIconSVG[slotKey]} />
    <CardDark sx={{ height: "100%", minWidth: "5em", flexGrow: 1, display: "flex" }}>
      {keys.length === 1 ?
        <Box p={1} justifyContent="center" alignItems="center" width="100%" display="flex" gap={1}>{StatIcon[keys[0]]}{KeyMap.getStr(keys[0])}</Box> :
        <DropdownButton sx={{ px: 0 }} fullWidth title={<StatWithUnit statKey={statKey} />} color={KeyMap.getVariant(statKey) ?? "success"}>
          {keys.map(msk =>
            <MenuItem key={msk} disabled={statKey === msk} onClick={() => setSlot({ statKey: msk })}>
              <StatColoredWithUnit statKey={msk} />
            </MenuItem>)}
        </DropdownButton>}
    </CardDark>
    <DropdownButton sx={{ px: 0 }} title={<span>{rarity} <FontAwesomeIcon icon={faStar} /></span>} >
      {[5, 4, 3].map(r =>
        <MenuItem key={r} disabled={rarity === r} onClick={() => setRarity(r as ArtifactRarity)}>
          <span>{r} <FontAwesomeIcon icon={faStar} /></span>
        </MenuItem>)}
    </DropdownButton>
    <CustomNumberInput startAdornment="+" value={level} color={Artifact.levelVariant(level)} onChange={l => l !== undefined && setSlot({ level: l })} sx={{ borderRadius: 1, pl: 1, my: 0, height: "100%" }} inputProps={{ sx: { pl: 0.5, width: "2em" }, max: 20, min: 0 }} />
    <CardDark sx={{ height: "100%", minWidth: "4em" }}>
      <Box p={1} textAlign="center">{`${cacheValueString(Artifact.mainStatValue(statKey, rarity, level), KeyMap.unit(statKey))}${KeyMap.unit(statKey)}`}</Box>
    </CardDark>
  </Box>
}

function ArtifactSetsEditor({ artSet, setArtSet }: { artSet: ISet, setArtSet(artSet: ISet) }) {
  const artifactSheets = usePromise(() => ArtifactSheet.getAll, [])
  const setSet = useCallback((setKey: ArtifactSetKey | "") => {
    if (!setKey || !artifactSheets) return
    setArtSet({ ...artSet, [setKey]: parseInt(Object.keys(artifactSheets(setKey).setEffects)[0]) })
  }, [artSet, setArtSet, artifactSheets])

  const setValue = useCallback((setKey: ArtifactSetKey) => (value: 1 | 2 | 4) => setArtSet({ ...artSet, [setKey]: value }), [artSet, setArtSet])
  const deleteValue = useCallback((setKey: ArtifactSetKey) => () => {
    const { [setKey]: _, ...rest } = artSet
    setArtSet({ ...rest })
  }, [artSet, setArtSet])

  const remaining = 5 - Object.values(artSet).reduce((a, b) => a + b, 0)

  return <Stack spacing={1} sx={{ flexGrow: 1 }}>
    {Object.entries(artSet).map(([setKey, value]) => <ArtifactSetEditor key={setKey} setKey={setKey} value={value} setValue={setValue(setKey)} deleteValue={deleteValue(setKey)} remaining={remaining} />)}
    <CardLight sx={{ flexGrow: 1 }}>
      <ArtifactSetSingleAutocomplete
        showDefault
        disableClearable
        size="small"
        artSetKey={""}
        setArtSetKey={setSet}
        sx={(theme) => ({
          flexGrow: 1,
          ".MuiFilledInput-root": {
            borderBottomRightRadius: theme.shape.borderRadius,
            borderBottomLeftRadius: theme.shape.borderRadius
          }
        })}
        defaultText={"New Artifact Set"}
        disable={(setKey) => Object.keys(artSet).includes(setKey) || !artifactSheets?.(setKey) || Object.keys(artifactSheets(setKey).setEffects).every(n => parseInt(n) > remaining)}
      />
    </CardLight>

  </Stack>
}
function ArtifactSetEditor({ setKey, value, setValue, deleteValue, remaining }: { setKey: ArtifactSetKey, value: 1 | 2 | 4, setValue: (v: 1 | 2 | 4) => void, deleteValue: () => void, remaining: number }) {
  const artifactSheet = usePromise(() => ArtifactSheet.get(setKey), [])

  /* Assumes that all conditionals are from 4-Set. needs to change if there are 2-Set conditionals */
  const set4CondNums = useMemo(() => {
    if (value < 4 || !artifactSheet) return []
    return Object.keys(artifactSheet.setEffects).filter(setNumKey => artifactSheet.setEffects[setNumKey]?.document.some(doc => "states" in doc))
  }, [artifactSheet, value])

  if (!artifactSheet) return null
  return <CardLight>
    <Box display="flex">
      <ArtifactSetTooltip artifactSheet={artifactSheet} numInSet={value}>
        <Box flexGrow={1} p={1} display="flex" gap={1} alignItems="center">
          <ImgIcon size={2} sx={{ m: -1 }} src={artifactSheet.defIconSrc} />
          <Box >{artifactSheet.setName}</Box>
          <Info />
        </Box>
      </ArtifactSetTooltip>
      <ButtonGroup>
        <DropdownButton size="small" title={<Box whiteSpace="nowrap">{value}-set</Box>}>
          {Object.keys(artifactSheet.setEffects).map(setKey => parseInt(setKey)).map(setKey =>
            <MenuItem key={setKey} disabled={value === setKey || setKey > (remaining + value)} onClick={() => setValue(setKey as 1 | 2 | 4)}>{setKey}-set</MenuItem>
          )}
        </DropdownButton>
        <Button color="error" size="small" onClick={deleteValue}>
          <DeleteForever />
        </Button>
      </ButtonGroup>
    </Box>
    {!!set4CondNums.length && <Stack spacing={1} sx={{ p: 1 }}>
      {set4CondNums.map(setNumKey =>
        <SetEffectDisplay key={setNumKey} setKey={setKey} setNumKey={parseInt(setNumKey) as SetNum} hideHeader conditionalsOnly />
      )}
    </Stack>}
  </CardLight>
}
function ArtifactSubCard({ substats, setSubstats, substatsType, setSubstatsType, mainStatKeys }: { substats: Record<SubstatKey, number>, setSubstats: (substats: Record<SubstatKey, number>) => void, substatsType: SubstatType, setSubstatsType: (t: SubstatType) => void, mainStatKeys: MainStatKey[] }) {
  const setValue = useCallback((key: SubstatKey) => (v: number) => setSubstats({ ...substats, [key]: v }), [substats, setSubstats])
  const { t } = useTranslation("page_character")
  const rv = Object.entries(substats).reduce((t, [k, v]) => t + (v / Artifact.substatValue(k)), 0) * 100
  const rolls = Object.entries(substats).reduce((t, [k, v]) => t + (v / Artifact.substatValue(k, undefined, substatsType)), 0)
  return <CardLight sx={{ p: 1, height: "100%" }}>
    <Box sx={{ mb: 1, display: "flex", gap: 1 }}>
      <DropdownButton fullWidth title={t(`tabTheorycraft.substatType.${substatsType}`)}>
        {substatType.map(st => <MenuItem key={st} disabled={substatsType === st} onClick={() => setSubstatsType(st)}>{t(`tabTheorycraft.substatType.${st}`)}</MenuItem>)}
      </DropdownButton>
      <BootstrapTooltip title={<Typography>{t`tabTheorycraft.maxTotalRolls`}</Typography>} placement="top">
        <CardDark sx={{ textAlign: "center", py: 0.5, px: 1, minWidth: "15em", whiteSpace: "nowrap", display: "flex", gap: 2, justifyContent: "flex-end", alignItems: "center" }}>
          <ColorText color={rolls > 45 ? "warning" : undefined} >Rolls: <strong>{rolls.toFixed(0)}</strong></ColorText>
          <ColorText color={rolls > 45 ? "warning" : undefined} >RV: <strong>{rv.toFixed(1)}%</strong></ColorText>
        </CardDark>
      </BootstrapTooltip>
    </Box>
    <Stack spacing={1}>
      {Object.entries(substats).map(([k, v]) => <ArtifactSubstatEditor key={k} statKey={k} value={v} setValue={setValue(k)} substatsType={substatsType} mainStatKeys={mainStatKeys} />)}
    </Stack>
  </CardLight>
}
function ArtifactSubstatEditor({ statKey, value, setValue, substatsType, mainStatKeys }: { statKey: SubstatKey, value: number, setValue: (v: number) => void, substatsType: SubstatType, mainStatKeys: MainStatKey[] }) {
  const { t } = useTranslation("page_character")
  const unit = KeyMap.unit(statKey)
  const substatValue = Artifact.substatValue(statKey, 5, substatsType)
  const rv = value / Artifact.substatValue(statKey) * 100
  const rolls = value / substatValue
  const numMains = mainStatKeys.reduce((t, ms) => t + (ms === statKey ? 1 : 0), 0)
  const maxRolls = (5 - numMains) * 6
  const invalid = rolls > maxRolls
  return <Box display="flex" gap={1} justifyContent="space-between" alignItems="center">
    <CardDark sx={{ p: 0.5, minWidth: "11em", flexGrow: 1, display: "flex", gap: 1, alignItems: "center", justifyContent: "center" }}>
      {StatIcon[statKey]}{KeyMap.getStr(statKey)}{KeyMap.unit(statKey)}
    </CardDark>
    <CustomNumberInput
      color={value ? "success" : "primary"}
      float={KeyMap.unit(statKey) === "%"}
      endAdornment={KeyMap.unit(statKey) || <Box width="1em" component="span" />}
      value={parseFloat(value.toFixed(2))}
      onChange={v => v !== undefined && setValue(v)}
      sx={{ borderRadius: 1, px: 1, height: "100%", width: "6em" }}
      inputProps={{ sx: { textAlign: "right" }, min: 0 }} />
    <CustomNumberInput
      color={value ? (invalid ? "warning" : "success") : "primary"}
      float
      startAdornment={<Box sx={{ whiteSpace: "nowrap", width: "7em", display: "flex", justifyContent: "space-between" }}><span>{cacheValueString(substatValue, unit)}{unit}</span><span>x</span></Box>}
      value={parseFloat(rolls.toFixed(2))}
      onChange={v => v !== undefined && setValue(v * substatValue)}
      sx={{ borderRadius: 1, px: 1, my: 0, height: "100%", width: "7em" }}
      inputProps={{ sx: { textAlign: "right", pr: 0.5, }, min: 0, step: 1 }} />
    <BootstrapTooltip title={<Typography>{t(numMains ? `tabTheorycraft.maxRollsMain` : `tabTheorycraft.maxRolls`, { value: maxRolls })}</Typography>} placement="top">
      <CardDark sx={{ textAlign: "center", p: 0.5, minWidth: "8em" }}>
        <ColorText color={invalid ? "warning" : undefined}>RV: <strong>{rv.toFixed(1)}%</strong></ColorText>
      </CardDark>
    </BootstrapTooltip>
  </Box>

}
