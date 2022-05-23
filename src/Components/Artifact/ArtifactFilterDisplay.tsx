import { faBan, faChartLine } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Autocomplete, Grid, TextField, ToggleButton, useTheme } from "@mui/material"
import { Trans, useTranslation } from "react-i18next"
import { FilterOption } from "../../PageArtifact/ArtifactSort"
import { allArtifactRarities, allSlotKeys } from "../../Types/consts"
import CharacterAutocomplete from "../Character/CharacterAutocomplete"
import MenuItemWithImage from "../MenuItemWithImage"
import SolidToggleButtonGroup from "../SolidToggleButtonGroup"
import { Stars } from "../StarDisplay"
import { ArtifactMainStatAutocomplete, ArtifactSetAutocomplete, ArtifactSubstatAutocomplete } from "./ArtifactAutocomplete"
import ArtifactLevelSlider from "./ArtifactLevelSlider"
import { artifactSlotIcon } from "./SlotNameWIthIcon"

export default function ArtifactFilterDisplay({ filterOption, filterOptionDispatch, }: { filterOption: FilterOption, filterOptionDispatch: (any) => void }) {
  const { t } = useTranslation(["artifact", "ui"]);

  const { artSetKeys = [], mainStatKeys = [], rarity = [], slotKeys = [], levelLow, levelHigh, substats = [],
    location = "", excluded = "" } = filterOption
  const locationCharacterSheet = usePromise(CharacterSheet.get(location as CharacterKey), [location])

  let locationDisplay
  if (!location) locationDisplay = t("filterLocation.any")
  else if (location === "Inventory") locationDisplay = <span><BusinessCenter /> {t("filterLocation.inventory")}</span>
  else if (location === "Equipped") locationDisplay = <span><FontAwesomeIcon icon={faUserShield} /> {t("filterLocation.currentlyEquipped")}</span>
  else locationDisplay = <b>{locationCharacterSheet?.nameWIthIcon}</b>

  let excludedDisplay
  if (excluded === "excluded") excludedDisplay = <span><FontAwesomeIcon icon={faBan} /> {t`exclusion.excluded`}</span>
  else if (excluded === "included") excludedDisplay = <span><FontAwesomeIcon icon={faChartLine} /> {t`exclusion.included`}</span>
  else excludedDisplay = t("exclusionDisplay", { value: t("exclusion.any") })
  return <Grid container spacing={1} >
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
      {/* Artiface level filter */}
      <ArtifactLevelSlider showLevelText levelLow={levelLow} levelHigh={levelHigh}
        setLow={levelLow => filterOptionDispatch({ levelLow })}
        setHigh={levelHigh => filterOptionDispatch({ levelHigh })}
        setBoth={(levelLow, levelHigh) => filterOptionDispatch({ levelLow, levelHigh })} />
      <Box display="flex" gap={1}>
        {/* location */}
        <LocationDropdown dropdownProps={{ color: location ? "success" : "primary" }} title={locationDisplay} onChange={location => filterOptionDispatch({ location })} selectedCharacterKey={location} />
        {/* exclusion state */}
        <DropdownButton fullWidth title={excludedDisplay} color={excluded ? (excluded === "included" ? "success" : "error") : "primary"}>
          <MenuItem selected={excluded === ""} disabled={excluded === ""} onClick={() => filterOptionDispatch({ excluded: "" })}><Trans t={t} i18nKey="exclusion.any" >Any</Trans></MenuItem>
          <MenuItem selected={excluded === "excluded"} disabled={excluded === "excluded"} onClick={() => filterOptionDispatch({ excluded: "excluded" })}>
            <ListItemIcon>
              <FontAwesomeIcon icon={faBan} />
            </ListItemIcon>
            <ListItemText>
              <Trans t={t} i18nKey="exclusion.excluded" >Excluded</Trans>
            </ListItemText>
          </MenuItem>
          <MenuItem selected={excluded === "included"} disabled={excluded === "included"} onClick={() => filterOptionDispatch({ excluded: "included" })}>
            <ListItemIcon>
              <FontAwesomeIcon icon={faChartLine} />
            </ListItemIcon>
            <ListItemText>
              <Trans t={t} i18nKey="exclusion.included" >Included</Trans>
            </ListItemText>
          </MenuItem>
        </DropdownButton>
      </Box>
    </Grid>
    {/* right */}
    <Grid item xs={12} md={6} display="flex" flexDirection="column" gap={1}>
      {/* Artifact Set */}
      <ArtifactSetMultipleSelectChip artSetKeys={artSetKeys} setArtSetKeys={artSetKeys => filterOptionDispatch({ artSetKeys })} />
      <ArtifactMainStatMultipleSelectChip mainStatKeys={mainStatKeys} setMainStatKeys={mainStatKeys => filterOptionDispatch({ mainStatKeys })} />
      <ArtifactSubStatMultipleSelectChip subStatKeys={substats} setSubStatKeys={substats => filterOptionDispatch({ substats })} />
    </Grid>
  </Grid>
}
