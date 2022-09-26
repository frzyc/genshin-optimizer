import { faBan, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Lock, LockOpen } from '@mui/icons-material';
import { Box, Grid, ToggleButton } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { FilterOption } from "../../PageArtifact/ArtifactSort";
import { allArtifactRarities, allSlotKeys } from "../../Types/consts";
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
  filterOptionDispatch: (option: any) => void
  disableSlotFilter?: boolean
}
export default function ArtifactFilterDisplay({ filterOption, filterOptionDispatch, disableSlotFilter = false }: ArtifactFilterDisplayProps) {
  const { t } = useTranslation(["artifact", "ui"]);

  const { artSetKeys = [], mainStatKeys = [], rarity = [], slotKeys = [], levelLow = 0, levelHigh = 20, substats = [],
    location = "", exclusion = [...exclusionValues], locked = [...lockedValues], rvLow = 0, rvHigh = 900, lines = [] } = filterOption

  return <Grid container spacing={1}>
    {/* left */}
    <Grid item xs={12} md={6} display="flex" flexDirection="column" gap={1}>
      {/* Artifact stars filter */}
      <SolidToggleButtonGroup fullWidth value={rarity} size="small" >
        {allArtifactRarities.map(star => <ToggleButton key={star} value={star} onClick={() => filterOptionDispatch({ rarity: rarityHandler(rarity, star) })}><StarsDisplay stars={star} /></ToggleButton>)}
      </SolidToggleButtonGroup>
      {/* Artifact Slot */}
      <SolidToggleButtonGroup fullWidth value={slotKeys} size="small" disabled={disableSlotFilter}>
        {allSlotKeys.map(slotKey => <ToggleButton key={slotKey} value={slotKey} onClick={() => filterOptionDispatch({ slotKeys: slotHandler(slotKeys, slotKey) })}>{artifactSlotIcon(slotKey)}</ToggleButton>)}
      </SolidToggleButtonGroup>
      {/* exclusion + locked */}
      <Box display="flex" gap={1}>
        <SolidToggleButtonGroup fullWidth value={exclusion} size="small">
          {exclusionValues.map((v, i) => <ToggleButton key={v} value={v} sx={{ display: "flex", gap: 1 }} onClick={() => filterOptionDispatch({ exclusion: exclusionHandler(exclusion, v) })}>
            <FontAwesomeIcon icon={i ? faChartLine : faBan} /><Trans i18nKey={`exclusion.${v}`} t={t} />
          </ToggleButton>)}
        </SolidToggleButtonGroup>
        <SolidToggleButtonGroup fullWidth value={locked} size="small">
          {lockedValues.map((v, i) => <ToggleButton key={v} value={v} sx={{ display: "flex", gap: 1 }} onClick={() => filterOptionDispatch({ locked: lockedHandler(locked, v) })}>
            {i ? <LockOpen /> : <Lock />}<Trans i18nKey={`ui:${v}`} t={t} />
          </ToggleButton>)}
        </SolidToggleButtonGroup>
      </Box>
      {/* Lines */}
      <SolidToggleButtonGroup fullWidth value={lines} size="small">
        {[1, 2, 3, 4].map(line => <ToggleButton key={line} value={line} onClick={() => filterOptionDispatch({ lines: lineHandler(lines, line) })}>{t("substat", { count: line })}</ToggleButton>)}
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
