import { faBan, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Lock, LockOpen } from '@mui/icons-material';
import { Box, Chip, Grid, ToggleButton } from "@mui/material";
import { useContext, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { DatabaseContext } from "../../Database/Database";
import { FilterOption } from "../../PageArtifact/ArtifactSort";
import { allMainStatKeys, allSubstatKeys } from "../../Types/artifact";
import { allArtifactRarities, allArtifactSets, allSlotKeys } from "../../Types/consts";
import { handleMultiSelect } from "../../Util/MultiSelect";
import { catTotal } from "../../Util/totalUtils";
import SolidToggleButtonGroup from "../SolidToggleButtonGroup";
import { StarsDisplay } from "../StarDisplay";
import ArtifactLevelSlider from "./ArtifactLevelSlider";
import ArtifactMainStatMultiAutocomplete from "./ArtifactMainStatMultiAutocomplete";
import ArtifactSetMultiAutocomplete from "./ArtifactSetMultiAutocomplete";
import ArtifactSubstatMultiAutocomplete from "./ArtifactSubstatMultiAutocomplete";
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
  disableSlotFilter?: boolean,
  filteredIds: string[]
}
export default function ArtifactFilterDisplay({ filterOption, filterOptionDispatch, filteredIds, disableSlotFilter = false }: ArtifactFilterDisplayProps) {
  const { t } = useTranslation(["artifact", "ui"]);

  const { artSetKeys = [], mainStatKeys = [], rarity = [], slotKeys = [], levelLow = 0, levelHigh = 20, substats = [],
    location = "", exclusion = [...exclusionValues], locked = [...lockedValues], rvLow = 0, rvHigh = 900, lines = [] } = filterOption

  const { database } = useContext(DatabaseContext)

  const rarityTotal = useMemo(() => catTotal(allArtifactRarities, ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const rarity = art.rarity
    ct[rarity].total++
    if (filteredIds.includes(id)) ct[rarity].current++
  })), [database, filteredIds])

  const slotTotal = useMemo(() => catTotal(allSlotKeys, ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const sk = art.slotKey
    ct[sk].total++
    if (filteredIds.includes(id)) ct[sk].current++
  })), [database, filteredIds])

  const excludedTotal = useMemo(() => catTotal(["excluded", "included"], ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const sk = art.exclude ? "excluded" : "included"
    ct[sk].total++
    if (filteredIds.includes(id)) ct[sk].current++
  })), [database, filteredIds])

  const lockedTotal = useMemo(() => catTotal(["locked", "unlocked"], ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const sk = art.lock ? "locked" : "unlocked"
    ct[sk].total++
    if (filteredIds.includes(id)) ct[sk].current++
  })), [database, filteredIds])

  const linesTotal = useMemo(() => catTotal(["1", "2", "3", "4"], ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const lns = art.substats.filter(s => s.value).length
    ct[lns].total++
    if (filteredIds.includes(id)) ct[lns].current++
  })), [database, filteredIds])

  const artSetTotal = useMemo(() => catTotal(allArtifactSets, ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const sk = art.setKey
    ct[sk].total++
    if (filteredIds.includes(id)) ct[sk].current++
  })), [database, filteredIds])

  const artMainTotal = useMemo(() => catTotal(allMainStatKeys, ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    const mk = art.mainStatKey
    ct[mk].total++
    if (filteredIds.includes(id)) ct[mk].current++
  })), [database, filteredIds])

  const artSubTotal = useMemo(() => catTotal(allSubstatKeys, ct => Object.entries(database.arts.data).forEach(([id, art]) => {
    Object.values(art.substats).map(sub => {
      if (typeof sub !== "object") return
      const key = sub.key
      if (!key) return
      ct[key].total++
      if (filteredIds.includes(id)) ct[key].current++
    })
  })), [database, filteredIds])

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
      <ArtifactSetMultiAutocomplete totals={artSetTotal} artSetKeys={artSetKeys} setArtSetKeys={artSetKeys => filterOptionDispatch({ artSetKeys })} />
      <ArtifactMainStatMultiAutocomplete totals={artMainTotal} mainStatKeys={mainStatKeys} setMainStatKeys={mainStatKeys => filterOptionDispatch({ mainStatKeys })} />
      <ArtifactSubstatMultiAutocomplete totals={artSubTotal} substatKeys={substats} setSubstatKeys={substats => filterOptionDispatch({ substats })} />
      <LocationFilterAutocomplete location={location} setLocation={location => filterOptionDispatch({ location })} />
    </Grid>
  </Grid>
}
