import { faBan, faChartLine } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Autocomplete, Grid, ToggleButton, useTheme } from "@mui/material"
import { Trans, useTranslation } from "react-i18next"
import { FilterOption } from "../../PageArtifact/ArtifactSort"
import { allArtifactRarities, allSlotKeys } from "../../Types/consts"
import CharacterAutocomplete from "../Character/CharacterAutocomplete"
import MenuItemWithImage from "../MenuItemWithImage"
import SolidColoredTextField from "../SolidColoredTextfield"
import SolidToggleButtonGroup from "../SolidToggleButtonGroup"
import { Stars } from "../StarDisplay"
import { ArtifactMainStatMultiAutoComplete, ArtifactSetMultiAutoComplete, ArtifactSubstatMultiAutoComplete } from "./ArtifactAutocomplete"
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
        <Grid item flexGrow={1}>
          <Autocomplete
            autoHighlight
            options={[{ label: "" }, { label: "excluded" }, { label: "included" }]}
            value={{ label: excluded }}
            onChange={(_, value) => filterOptionDispatch({ excluded: value ? value.label : "" })}
            isOptionEqualToValue={(option, value) => option.label === value.label}
            getOptionLabel={(option) => t(`artifact:exclusion.${option.label ? option.label : "any"}`)}
            renderInput={(props) => <SolidColoredTextField
              {...props}
              label={t("artifact:exclusion.exclusion")}
              hasValue={excluded ? true : false}
              startAdornment={excluded === "excluded"
                ? <FontAwesomeIcon icon={faBan} />
                : excluded === "included"
                  ? <FontAwesomeIcon icon={faChartLine} />
                  : undefined
              }
            />}
            renderOption={(props, option) => <MenuItemWithImage
              key={option.label ? option.label : "default"}
              value={option.label ? option.label : "default"}
              image={option.label === "excluded"
                ? <FontAwesomeIcon icon={faBan} />
                : option.label === "included"
                  ? <FontAwesomeIcon icon={faChartLine} />
                  : undefined
              }
              text={<Trans t={t} i18nKey={`exclusion.${option.label ? option.label : "any"}`}>{option.label}</Trans>}
              theme={theme}
              isSelected={excluded === option.label}
              props={props}
            />}
          />
        </Grid>
      </Grid>
    </Grid>
    {/* right */}
    <Grid item xs={12} md={6} display="flex" flexDirection="column" gap={1}>
      {/* Artifact Set */}
      <ArtifactSetMultiAutoComplete artSetKeys={artSetKeys} setArtSetKeys={artSetKeys => filterOptionDispatch({ artSetKeys })} />
      <ArtifactMainStatMultiAutoComplete mainStatKeys={mainStatKeys} setMainStatKeys={mainStatKeys => filterOptionDispatch({ mainStatKeys })} />
      <ArtifactSubstatMultiAutoComplete substatKeys={substats} setSubstatKeys={substats => filterOptionDispatch({ substats })} />
    </Grid>
  </Grid>
}
