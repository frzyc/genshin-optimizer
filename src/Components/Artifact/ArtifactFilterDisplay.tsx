import { faBan, faChartLine, faUserShield } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { BusinessCenter, Replay } from "@mui/icons-material"
import { Divider, Grid, ListItemIcon, ListItemText, MenuItem, ToggleButton } from "@mui/material"
import { Box } from "@mui/system"
import { useContext, useMemo } from "react"
import { Trans, useTranslation } from "react-i18next"
import ArtifactLevelSlider from "./ArtifactLevelSlider"
import ArtifactMainStatMultipleSelectChip from "./ArtifactMainStatMultipleSelectChip"
import ArtifactSetMultipleSelectChip from "./ArtifactSetMultipleSelectChip"
import ArtifactSubStatMultipleSelectChip from "./ArtifactSubStatMultipleSelectChip"
import { artifactSlotIcon } from "./SlotNameWIthIcon"
import { CharacterMenuItemArray } from "../Character/CharacterDropdownButton"
import DropdownButton from "../DropdownMenu/DropdownButton"
import SolidToggleButtonGroup from "../SolidToggleButtonGroup"
import { Stars } from "../StarDisplay"
import CharacterSheet from "../../Data/Characters/CharacterSheet"
import { DatabaseContext } from "../../Database/Database"
import usePromise from "../../ReactHooks/usePromise"
import { allArtifactRarities, allSlotKeys, CharacterKey } from "../../Types/consts"
import { characterFilterConfigs } from "../../Util/CharacterSort"
import { FilterOption } from "../../PageArtifact/ArtifactSort"
import { identity as id } from "../../Util/Util"

export default function ArtifactFilterDisplay({ filterOption, filterOptionDispatch, }: { filterOption: FilterOption, filterOptionDispatch: (any) => void }) {
  const { t } = useTranslation(["artifact", "ui"]);

  const { artSetKeys = [], mainStatKeys = [], rarity = [], slotKeys = [], levelLow, levelHigh, substats = [],
    location = "", excluded = "" } = filterOption
  const locationCharacterSheet = usePromise(CharacterSheet.get(location as CharacterKey), [location])

  let locationDisplay
  if (!location) locationDisplay = t("filterLocation.any")
  else if (location === "Inventory") locationDisplay = <span><BusinessCenter /> {id<string>(t("filterLocation.inventory"))}</span>
  else if (location === "Equipped") locationDisplay = <span><FontAwesomeIcon icon={faUserShield} /> {id<string>(t("filterLocation.currentlyEquipped"))}</span>
  else locationDisplay = <b>{locationCharacterSheet?.nameWIthIcon}</b>

  let excludedDisplay
  if (excluded === "excluded") excludedDisplay = <span><FontAwesomeIcon icon={faBan} /> {id<string>(t`exclusion.excluded`)}</span>
  else if (excluded === "included") excludedDisplay = <span><FontAwesomeIcon icon={faChartLine} /> {id<string>(t`exclusion.included`)}</span>
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

function LocationDropdown({ title, onChange, selectedCharacterKey, dropdownProps }) {
  const { database } = useContext(DatabaseContext)
  const characterSheets = usePromise(CharacterSheet.getAll, [])
  const filterConfigs = useMemo(() => characterSheets && characterFilterConfigs(database, characterSheets), [database, characterSheets])
  const { t } = useTranslation(["artifact", "ui"]);

  return <DropdownButton fullWidth {...dropdownProps} title={title}>
    <MenuItem key="unselect" selected={selectedCharacterKey === ""} disabled={selectedCharacterKey === ""} onClick={() => onChange("")}>
      <ListItemIcon>
        <Replay />
      </ListItemIcon>
      <ListItemText>
        <Trans t={t} i18nKey="ui:unselect" >Unselect</Trans>
      </ListItemText>
    </MenuItem>
    <MenuItem key="inventory" selected={selectedCharacterKey === "Inventory"} disabled={selectedCharacterKey === "Inventory"} onClick={() => onChange("Inventory")}>
      <ListItemIcon>
        <BusinessCenter />
      </ListItemIcon>
      <ListItemText>
        <Trans t={t} i18nKey="filterLocation.inventory" >Inventory</Trans>
      </ListItemText>
    </MenuItem>
    <MenuItem key="equipped" selected={selectedCharacterKey === "Equipped"} disabled={selectedCharacterKey === "Equipped"} onClick={() => onChange("Equipped")}>
      <ListItemIcon>
        <FontAwesomeIcon icon={faUserShield} />
      </ListItemIcon>
      <ListItemText>
        <Trans t={t} i18nKey="filterLocation.currentlyEquipped" >Currently Equipped</Trans>
      </ListItemText>
    </MenuItem>
    <Divider />
    {!!characterSheets && CharacterMenuItemArray(characterSheets, database._getCharKeys().sort(), onChange, selectedCharacterKey, filterConfigs)}
  </DropdownButton>
}
