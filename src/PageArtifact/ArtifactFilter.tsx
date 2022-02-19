import { faBan, faChartLine, faTrash, faUserShield, faUserSlash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { BusinessCenter, Lock, LockOpen, Replay } from "@mui/icons-material"
import { Button, CardContent, Divider, Grid, ListItemIcon, ListItemText, MenuItem, Skeleton, ToggleButton, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { Suspense, useContext, useMemo } from "react"
import { Trans, useTranslation } from "react-i18next"
import ArtifactLevelSlider from "../Components/Artifact/ArtifactLevelSlider"
import ArtifactMainStatMultipleSelectChip from "../Components/Artifact/ArtifactMainStatMultipleSelectChip"
import ArtifactSetMultipleSelectChip from "../Components/Artifact/ArtifactSetMultipleSelectChip"
import ArtifactSubStatMultipleSelectChip from "../Components/Artifact/ArtifactSubStatMultipleSelectChip"
import { artifactSlotIcon } from "../Components/Artifact/SlotNameWIthIcon"
import CardDark from "../Components/Card/CardDark"
import { CharacterMenuItemArray } from "../Components/Character/CharacterDropdownButton"
import DropdownButton from "../Components/DropdownMenu/DropdownButton"
import SolidToggleButtonGroup from "../Components/SolidToggleButtonGroup"
import SqBadge from "../Components/SqBadge"
import { Stars } from "../Components/StarDisplay"
import CharacterSheet from "../Data/Characters/CharacterSheet"
import { DatabaseContext } from "../Database/Database"
import usePromise from "../ReactHooks/usePromise"
import { ICachedArtifact } from "../Types/artifact"
import { allArtifactRarities, allSlotKeys, CharacterKey } from "../Types/consts"
import { FilterOption } from "./ArtifactSort"

export default function ArtifactFilter({ filterOption, filterOptionDispatch, filterDispatch, numShowing, total, }:
  { filterOption: FilterOption, filterOptionDispatch: (any) => void, filterDispatch: (any) => void, numShowing: number, total: number }) {
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

  return <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
    <CardDark  >
      <CardContent>
        <Grid container sx={{ mb: 1 }}>
          <Grid item >
            <Typography variant="h6"><Trans t={t} i18nKey="artifactFilter">Artifact Filter</Trans></Typography>
          </Grid>
          <Grid item flexGrow={1} display="flex" justifyContent="center" alignItems="center">
            {numShowing !== total && <Typography>Filtered {numShowing} / {total}</Typography>}
          </Grid>
          <Grid item>
            <Button size="small" color="error" onClick={() => filterDispatch({ type: "reset" })} startIcon={<Replay />}>
              <Trans t={t} i18nKey="ui:reset" />
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={1} sx={{ mb: 1 }}>
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
            <ArtifactLevelSlider levelLow={levelLow} levelHigh={levelHigh}
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
      </CardContent>
    </CardDark>
  </Suspense>
}


function LocationDropdown({ title, onChange, selectedCharacterKey, dropdownProps }) {
  const database = useContext(DatabaseContext)
  const characterSheets = usePromise(CharacterSheet.getAll, [])
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
    {!!characterSheets && CharacterMenuItemArray(characterSheets, database._getCharKeys().sort(), onChange, selectedCharacterKey)}
  </DropdownButton>
}

export function ArtifactRedButtons({ artifactIds, filterOption }:
  { artifactIds: string[], filterOption: FilterOption }) {
  const { t } = useTranslation(["artifact", "ui"]);
  const database = useContext(DatabaseContext)
  const { numDelete, numUnequip, numExclude, numInclude, numUnlock, numLock } = useMemo(() => {
    const artifacts = artifactIds.map(id => database._getArt(id)) as ICachedArtifact[]
    const numUnlock = artifacts.reduce((a, art) => a + (art.lock ? 0 : 1), 0)
    const numLock = artifacts.length - numUnlock
    const numDelete = numUnlock
    const numUnequip = artifacts.reduce((a, art) => a + (art.location ? 1 : 0), 0)
    const numExclude = artifacts.reduce((a, art) => a + (art.exclude ? 1 : 0), 0)
    const numInclude = artifacts.length - numExclude

    return { numDelete, numUnequip, numExclude, numInclude, numUnlock, numLock }
  }, [artifactIds, database])

  const unequipArtifacts = () =>
    window.confirm(`Are you sure you want to unequip ${numUnequip} artifacts currently equipped on characters?`) &&
    artifactIds.map(id => database.setArtLocation(id, ""))

  const deleteArtifacts = () =>
    window.confirm(`Are you sure you want to delete ${numDelete} artifacts?`) &&
    artifactIds.map(id => !database._getArt(id)?.lock && database.removeArt(id))

  const excludeArtifacts = () =>
    window.confirm(`Are you sure you want to exclude ${numInclude} artifacts from build generations?`) &&
    artifactIds.map(id => database.updateArt({ exclude: true }, id))

  const includeArtifacts = () =>
    window.confirm(`Are you sure you want to include ${numExclude} artifacts in build generations?`) &&
    artifactIds.map(id => database.updateArt({ exclude: false }, id))

  const lockArtifacts = () =>
    window.confirm(`Are you sure you want to lock ${numUnlock} artifacts?`) &&
    artifactIds.map(id => database.updateArt({ lock: true }, id))

  const unlockArtifacts = () =>
    window.confirm(`Are you sure you want to unlock ${numLock} artifacts?`) &&
    artifactIds.map(id => database.updateArt({ lock: false }, id))

  return <Grid container spacing={1} alignItems="center">
    <Grid item xs={12} sm={6} md={3}>
      <Button fullWidth color="error" disabled={!numUnequip} onClick={unequipArtifacts} startIcon={<FontAwesomeIcon icon={faUserSlash} />}>
        <Trans t={t} i18nKey="button.unequipArtifacts" >Unequip Artifacts</Trans>
        <SqBadge sx={{ ml: 1 }} color={numUnequip ? "success" : "secondary"}>{numUnequip}</SqBadge>
      </Button>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Button fullWidth color="error" disabled={!numDelete} onClick={deleteArtifacts} startIcon={<FontAwesomeIcon icon={faTrash} />}>
        <Trans t={t} i18nKey="button.deleteArtifacts" >Delete Artifacts</Trans>
        <SqBadge sx={{ ml: 1 }} color={numDelete ? "success" : "secondary"}>{numDelete}</SqBadge>
      </Button>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Button fullWidth color="error" disabled={!numInclude} onClick={excludeArtifacts} startIcon={<FontAwesomeIcon icon={faBan} />}>
        <Trans t={t} i18nKey="button.excludeArtifacts" >Exclude Artifacts</Trans>
        <SqBadge sx={{ ml: 1 }} color={numInclude ? "success" : "secondary"}>{numInclude}</SqBadge>
      </Button>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Button fullWidth color="error" disabled={!numExclude} onClick={includeArtifacts} startIcon={<FontAwesomeIcon icon={faChartLine} />}>
        <Trans t={t} i18nKey="button.includeArtifacts" >Include Artifacts</Trans>
        <SqBadge sx={{ ml: 1 }} color={numExclude ? "success" : "secondary"}>{numExclude}</SqBadge>
      </Button>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Button fullWidth color="error" disabled={!numLock} onClick={unlockArtifacts} startIcon={<LockOpen />}>
        <Trans t={t} i18nKey="button.unlockrtifacts" >Unlock Artifacts</Trans>
        <SqBadge sx={{ ml: 1 }} color={numLock ? "success" : "secondary"}>{numLock}</SqBadge>
      </Button>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Button fullWidth color="error" disabled={!numUnlock} onClick={lockArtifacts} startIcon={<Lock />}>
        <Trans t={t} i18nKey="button.lockArtifacts" >Lock Artifacts</Trans>
        <SqBadge sx={{ ml: 1 }} color={numUnlock ? "success" : "secondary"}>{numUnlock}</SqBadge>
      </Button>
    </Grid>
    <Grid item xs={12} sm={12} md={6} display="flex" justifyContent="space-around">
      <Typography variant="caption" color="text.secondary"><Trans t={t} i18nKey="buttonHint">Note: the red buttons above only applies to <b>currently filtered artifacts</b></Trans></Typography>
    </Grid>
  </Grid>
}
