import { faBan, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Lock, LockOpen } from '@mui/icons-material';
import { Box, Chip, Grid, ToggleButton } from "@mui/material";
import { useContext, useEffect, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { DatabaseContext } from "../../Database/Database";
import { FilterOption } from "../../PageArtifact/ArtifactSort";
import useForceUpdate from "../../ReactHooks/useForceUpdate";
import { allArtifactRarities, allSlotKeys, ArtifactRarity, SlotKey } from "../../Types/consts";
import { handleMultiSelect } from "../../Util/MultiSelect";
import SolidToggleButtonGroup from "../SolidToggleButtonGroup";
import { StarsDisplay } from "../StarDisplay";
import { ArtifactMainStatMultiAutocomplete, ArtifactSetMultiAutocomplete, ArtifactSubstatMultiAutocomplete } from "./ArtifactAutocomplete";
import ArtifactLevelSlider from "./ArtifactLevelSlider";
import LocationFilterAutocomplete from "./LocationFilterAutocomplete";
import RVSlide from "./RVSlide";
import { artifactSlotIcon } from "./SlotNameWIthIcon";

const exclusionValues = ["excluded", "included"] as const
const lockedValues = ["locked", "unlocked"] as const

const rarityHandler = handleMultiSelect([...allArtifactRarities])
const slotHandler = handleMultiSelect([...allSlotKeys])
const exclusionHandler = handleMultiSelect([...exclusionValues])
const lockedHandler = handleMultiSelect([...lockedValues])
const lineHandler = handleMultiSelect([1, 2, 3, 4])

interface ArtifactFilterDisplayProps {
  filterOption: FilterOption
  filterOptionDispatch: (option: Partial<FilterOption>) => void
  disableSlotFilter?: boolean
}
export default function ArtifactFilterDisplay({ filterOption, filterOptionDispatch, disableSlotFilter = false }: ArtifactFilterDisplayProps) {
  const { t } = useTranslation(["artifact", "ui"]);

  const { artSetKeys = [], mainStatKeys = [], rarity = [], slotKeys = [], levelLow = 0, levelHigh = 20, substats = [],
    location = "", exclusion = [...exclusionValues], locked = [...lockedValues], rvLow = 0, rvHigh = 900, lines = [] } = filterOption

  const { database } = useContext(DatabaseContext)
  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(() => database.arts.followAny(() => forceUpdate()), [database, forceUpdate])

  const rarityTotal = useMemo(() => {
    const tot = dbDirty && Object.fromEntries(allArtifactRarities.map(r => [r, 0])) as Record<ArtifactRarity, number>
    database.arts.values.forEach(a => tot[a.rarity]++)
    return tot
  }, [dbDirty, database])
  const slotTotal = useMemo(() => {
    const tot = dbDirty && Object.fromEntries(allSlotKeys.map(r => [r, 0])) as Record<SlotKey, number>
    database.arts.values.forEach(a => tot[a.slotKey]++)
    return tot
  }, [dbDirty, database])

  const excludedTotal = useMemo(() => {
    const tot = dbDirty && { excluded: 0, included: 0 }
    database.arts.values.forEach(a => tot[a.exclude ? "excluded" : "included"]++)
    return tot
  }, [dbDirty, database])

  const lockedTotal = useMemo(() => {
    const tot = dbDirty && { locked: 0, unlocked: 0 }
    database.arts.values.forEach(a => tot[a.lock ? "locked" : "unlocked"]++)
    return tot
  }, [dbDirty, database])

  const linesTotal = useMemo(() => {
    const tot = dbDirty && { 1: 0, 2: 0, 3: 0, 4: 0 }
    database.arts.values.forEach(a => tot[a.substats.filter(s => s.value).length]++)
    return tot
  }, [dbDirty, database])

  return <Grid container spacing={1}>
    {/* left */}
    <Grid item xs={12} md={6} display="flex" flexDirection="column" gap={1}>
      {/* Artifact rarity filter */}
      <SolidToggleButtonGroup fullWidth value={rarity} size="small" >
        {allArtifactRarities.map(star => <ToggleButton key={star} sx={{ display: "flex", gap: 1 }} value={star} onClick={() => filterOptionDispatch({ rarity: rarityHandler(rarity, star) })}><StarsDisplay stars={star} /><Chip label={rarityTotal[star]} size="small" /></ToggleButton>)}
      </SolidToggleButtonGroup>
      {/* Artifact Slot */}
      <SolidToggleButtonGroup fullWidth value={slotKeys} size="small" disabled={disableSlotFilter}>
        {allSlotKeys.map(slotKey => <ToggleButton key={slotKey} sx={{ display: "flex", gap: 1 }} value={slotKey} onClick={() => filterOptionDispatch({ slotKeys: slotHandler(slotKeys, slotKey) })}>{artifactSlotIcon(slotKey)}<Chip label={slotTotal[slotKey]} size="small" /></ToggleButton>)}
      </SolidToggleButtonGroup>
      {/* exclusion + locked */}
      <Box display="flex" gap={1}>
        <SolidToggleButtonGroup fullWidth value={exclusion} size="small">
          {exclusionValues.map((v, i) => <ToggleButton key={v} value={v} sx={{ display: "flex", gap: 1 }} onClick={() => filterOptionDispatch({ exclusion: exclusionHandler(exclusion, v) })}>
            <FontAwesomeIcon icon={i ? faChartLine : faBan} /><Trans i18nKey={`exclusion.${v}`} t={t} /><Chip label={excludedTotal[i ? "included" : "excluded"]} size="small" />
          </ToggleButton>)}
        </SolidToggleButtonGroup>
        <SolidToggleButtonGroup fullWidth value={locked} size="small">
          {lockedValues.map((v, i) => <ToggleButton key={v} value={v} sx={{ display: "flex", gap: 1 }} onClick={() => filterOptionDispatch({ locked: lockedHandler(locked, v) })}>
            {i ? <LockOpen /> : <Lock />}<Trans i18nKey={`ui:${v}`} t={t} /><Chip label={lockedTotal[i ? "unlocked" : "locked"]} size="small" />
          </ToggleButton>)}
        </SolidToggleButtonGroup>
      </Box>
      {/* Lines */}
      <SolidToggleButtonGroup fullWidth value={lines} size="small">
        {[1, 2, 3, 4].map(line => <ToggleButton key={line} value={line} onClick={() => filterOptionDispatch({ lines: lineHandler(lines, line) as Array<1 | 2 | 3 | 4> })}><Box mr={1}>{t("substat", { count: line })}</Box><Chip label={linesTotal[line]} size="small" /></ToggleButton>)}
      </SolidToggleButtonGroup>
      {/* Artiface level filter */}
      <ArtifactLevelSlider showLevelText levelLow={levelLow} levelHigh={levelHigh}
        setLow={levelLow => filterOptionDispatch({ levelLow })}
        setHigh={levelHigh => filterOptionDispatch({ levelHigh })}
        setBoth={(levelLow, levelHigh) => filterOptionDispatch({ levelLow, levelHigh })} />

      <RVSlide showLevelText levelLow={rvLow} levelHigh={rvHigh}
        setLow={rvLow => filterOptionDispatch({ rvLow })}
        setHigh={rvHigh => filterOptionDispatch({ rvHigh })}
        setBoth={(rvLow, rvHigh) => filterOptionDispatch({ rvLow, rvHigh })} />

    </Grid>
    {/* right */}
    <Grid item xs={12} md={6} display="flex" flexDirection="column" gap={1}>
      {/* Artifact Set */}
      <ArtifactSetMultiAutocomplete artSetKeys={artSetKeys} setArtSetKeys={artSetKeys => filterOptionDispatch({ artSetKeys })} />
      <ArtifactMainStatMultiAutocomplete mainStatKeys={mainStatKeys} setMainStatKeys={mainStatKeys => filterOptionDispatch({ mainStatKeys })} />
      <ArtifactSubstatMultiAutocomplete substatKeys={substats} setSubstatKeys={substats => filterOptionDispatch({ substats })} />
      <LocationFilterAutocomplete location={location} setLocation={location => filterOptionDispatch({ location })} />
    </Grid>
  </Grid>
}
