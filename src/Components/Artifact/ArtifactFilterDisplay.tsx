import { faBan, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Lock, LockOpen } from '@mui/icons-material';
import { Box, Grid, ToggleButton } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { FilterOption } from "../../PageArtifact/ArtifactSort";
import { allArtifactRarities, allSlotKeys } from "../../Types/consts";
import CharacterAutocomplete from "../Character/CharacterAutocomplete";
import SolidToggleButtonGroup from "../SolidToggleButtonGroup";
import { Stars } from "../StarDisplay";
import { ArtifactMainStatMultiAutocomplete, ArtifactSetMultiAutocomplete, ArtifactSubstatMultiAutocomplete } from "./ArtifactAutocomplete";
import ArtifactLevelSlider from "./ArtifactLevelSlider";
import { artifactSlotIcon } from "./SlotNameWIthIcon";

export default function ArtifactFilterDisplay({ filterOption, filterOptionDispatch, }: { filterOption: FilterOption, filterOptionDispatch: (any) => void }) {
  const { t } = useTranslation(["artifact", "ui"]);

  const { artSetKeys = [], mainStatKeys = [], rarity = [], slotKeys = [], levelLow, levelHigh, substats = [],
    location = "", exclusion = ["excluded", "included"], locked = ["locked", "unlocked"] } = filterOption

  return <Grid container spacing={1}>
    {/* left */}
    <Grid item xs={12} md={6} display="flex" flexDirection="column" gap={1}>
      {/* Artifact stars filter */}
      <SolidToggleButtonGroup fullWidth onChange={(e, newVal) => filterOptionDispatch({ rarity: newVal })} value={rarity} size="small">
        {allArtifactRarities.map(star => <ToggleButton key={star} value={star}><Stars stars={star} /></ToggleButton>)}
      </SolidToggleButtonGroup>
      {/* Artifact Slot */}
      <SolidToggleButtonGroup fullWidth onChange={(e, newVal) => filterOptionDispatch({ slotKeys: newVal })} value={slotKeys} size="small">
        {allSlotKeys.map(slotKey => <ToggleButton key={slotKey} value={slotKey}>{artifactSlotIcon(slotKey)}</ToggleButton>)}
      </SolidToggleButtonGroup>
      {/* exclusion + locked */}
      <Box display="flex" gap={1}>
        <SolidToggleButtonGroup fullWidth value={exclusion} onChange={(e, newVal) => filterOptionDispatch({ exclusion: newVal })} size="small">
          <ToggleButton value="excluded" sx={{ display: "flex", gap: 1 }}>
            <FontAwesomeIcon icon={faBan} /><Trans i18nKey={"exclusion.excluded"} t={t} />
          </ToggleButton>
          <ToggleButton value="included" sx={{ display: "flex", gap: 1 }}>
            <FontAwesomeIcon icon={faChartLine} /><Trans i18nKey={"exclusion.included"} t={t} />
          </ToggleButton>
        </SolidToggleButtonGroup>
        <SolidToggleButtonGroup fullWidth value={locked} onChange={(e, newVal) => filterOptionDispatch({ locked: newVal })} size="small">
          <ToggleButton value="locked" sx={{ display: "flex", gap: 1 }}>
            <Lock /><Trans i18nKey={"ui:locked"} t={t} />
          </ToggleButton>
          <ToggleButton value="unlocked" sx={{ display: "flex", gap: 1 }}>
            <LockOpen /><Trans i18nKey={"ui:unlocked"} t={t} />
          </ToggleButton>
        </SolidToggleButtonGroup>
      </Box>
      {/* Artiface level filter */}
      <ArtifactLevelSlider showLevelText levelLow={levelLow} levelHigh={levelHigh}
        setLow={levelLow => filterOptionDispatch({ levelLow })}
        setHigh={levelHigh => filterOptionDispatch({ levelHigh })}
        setBoth={(levelLow, levelHigh) => filterOptionDispatch({ levelLow, levelHigh })} />
      <Grid container display="flex" gap={1}>
        <Grid item flexGrow={1}>
          {/* location */}
          <CharacterAutocomplete
            value={location}
            onChange={location => filterOptionDispatch({ location })}
            placeholderText={t("artifact:filterLocation.any")}
            defaultText={t("artifact:filterLocation.any")}
            labelText={t("artifact:filterLocation.location")}
            showDefault
            showInventory
            showEquipped
          />
        </Grid>
      </Grid>
    </Grid>
    {/* right */}
    <Grid item xs={12} md={6} display="flex" flexDirection="column" gap={1}>
      {/* Artifact Set */}
      <ArtifactSetMultiAutocomplete artSetKeys={artSetKeys} setArtSetKeys={artSetKeys => filterOptionDispatch({ artSetKeys })} />
      <ArtifactMainStatMultiAutocomplete mainStatKeys={mainStatKeys} setMainStatKeys={mainStatKeys => filterOptionDispatch({ mainStatKeys })} />
      <ArtifactSubstatMultiAutocomplete substatKeys={substats} setSubstatKeys={substats => filterOptionDispatch({ substats })} />
    </Grid>
  </Grid>
}
