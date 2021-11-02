import { faBan, faChartLine, faTrash, faUserShield, faUserSlash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { BusinessCenter, Lock, LockOpen, Replay } from "@mui/icons-material"
import { Button, CardContent, Divider, Grid, ListItemIcon, ListItemText, MenuItem, Skeleton, Slider, ToggleButton, Typography } from "@mui/material"
import { Suspense, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import CharacterSheet from "../Character/CharacterSheet"
import ArtifactSetDropdown from "../Components/Artifact/ArtifactSetDropdown"
import ArtifactSlotDropdown from "../Components/Artifact/ArtifactSlotDropdown"
import CardDark from "../Components/Card/CardDark"
import CardLight from "../Components/Card/CardLight"
import { CharacterMenuItemArray } from "../Components/Character/CharacterDropdownButton"
import CustomNumberInput from "../Components/CustomNumberInput"
import DropdownButton from "../Components/DropdownMenu/DropdownButton"
import SolidToggleButtonGroup from "../Components/SolidToggleButtonGroup"
import SortByButton from "../Components/SortByButton"
import SqBadge from "../Components/SqBadge"
import { Stars } from "../Components/StarDisplay"
import { DatabaseContext } from "../Database/Database"
import usePromise from "../ReactHooks/usePromise"
import Stat from "../Stat"
import { allMainStatKeys, allSubstats, ICachedArtifact } from "../Types/artifact"
import { allArtifactRarities, CharacterKey } from "../Types/consts"
import { ArtifactSortKey, FilterOption, artifactSortKeys, artifactSortKeysTC } from "./ArtifactSort"
import { clamp } from "../Util/Util"
import { GlobalSettingsContext } from "../GlobalSettings"

export default function ArtifactFilter({ artifactIds, filterOption, sortType, ascending, filterOptionDispatch, filterDispatch }:
  { artifactIds: string[], filterOption: FilterOption, sortType: ArtifactSortKey, ascending: boolean, filterOptionDispatch: (any) => void, filterDispatch: (any) => void }) {
  const { t } = useTranslation(["artifact", "ui"]);
  const { globalSettings: { tcMode } } = useContext(GlobalSettingsContext)
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

  const { artSetKey, slotKey, mainStatKey, rarity, levelLow, levelHigh, substats,
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

  const [sliderLow, setsliderLow] = useState(levelLow)
  const [sliderHigh, setsliderHigh] = useState(levelHigh)
  const setSlider = useCallback(
    (e, [l, h]) => {
      setsliderLow(l)
      setsliderHigh(h)
    },
    [setsliderLow, setsliderHigh])
  useEffect(() => setsliderLow(levelLow), [levelLow, setsliderLow])

  useEffect(() => setsliderHigh(levelHigh), [setsliderHigh, levelHigh])
  return <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
    <CardDark  >
      <CardContent>
        <Grid container sx={{ mb: 1 }}>
          <Grid item flexGrow={1}>
            <Typography variant="h6"><Trans t={t} i18nKey="artifactFilter">Artifact Filter</Trans></Typography>
          </Grid>
          <Grid item>
            <Button size="small" color="error" onClick={() => filterDispatch({ type: "reset" })} startIcon={<Replay />}>
              <Trans t={t} i18nKey="ui:reset" />
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {/* left */}
          <Grid item xs={12} md={6} sx={{
            //select all excluding last
            "> *:nth-last-of-type(n+2)": { mb: 1 }
          }}>
            {/* Artifact Set */}
            <div><ArtifactSetDropdown hasUnselect selectedSetKey={artSetKey} onChange={setKey => filterOptionDispatch({ artSetKey: setKey })} fullWidth /></div>
            {/* Artifact stars filter */}
            <SolidToggleButtonGroup fullWidth onChange={(e, newVal) => filterOptionDispatch({ rarity: newVal })} value={rarity} size="small">
              {allArtifactRarities.map(star => <ToggleButton key={star} value={star}><Stars stars={star} /></ToggleButton>)}
            </SolidToggleButtonGroup>
            {/* Artiface level filter */}
            <CardLight sx={{ width: "100%", display: "flex", alignItems: "center" }}>
              <CustomNumberInput
                value={sliderLow || levelLow}
                onChange={val => filterOptionDispatch({ levelLow: clamp(val, 0, levelHigh) })}
                sx={{ pl: 2, width: 100, }}
                inputProps={{ sx: { textAlign: "center" } }}
                startAdornment={"Level: "}
              />
              <Slider sx={{ width: 100, flexGrow: 1, mx: 2 }}
                getAriaLabel={() => 'Arifact Level Range'}
                value={[sliderLow, sliderHigh]}
                onChange={setSlider}
                onChangeCommitted={(e, value) => filterOptionDispatch({ levelLow: value[0] ?? value, levelHigh: value[1] ?? value })}
                valueLabelDisplay="auto"
                min={0} max={20} step={1} marks
              />
              <CustomNumberInput
                value={sliderHigh || levelHigh}
                onChange={val => filterOptionDispatch({ levelHigh: clamp(val, levelLow, 20) })}
                sx={{ px: 1, width: 50, }}
                inputProps={{ sx: { textAlign: "center" } }}
              />
            </CardLight>
            {/* Sort */}
            <SortByButton fullWidth sortKeys={[...artifactSortKeys.filter(key => (artifactSortKeysTC as unknown as string[]).includes(key) ? tcMode : true)]}
              value={sortType} onChange={sortType => filterDispatch({ sortType })}
              ascending={ascending} onChangeAsc={ascending => filterDispatch({ ascending })}
            />
          </Grid>
          {/* right */}
          <Grid item container xs={12} md={6} spacing={1}>
            {/* right-left */}
            <Grid item xs={6} sx={{
              //select all excluding last
              "> *:nth-last-of-type(n+2)": { mb: 1 }
            }} >
              {/* Artifact Slot */}
              <ArtifactSlotDropdown fullWidth hasUnselect slotKey={slotKey} onChange={slotKey => filterOptionDispatch({ slotKey })} />
              {/* Main Stat filter */}
              <DropdownButton fullWidth title={Stat.getStatNameWithPercent(mainStatKey, t(`mainStat`))} color={mainStatKey ? "success" : "primary"}  >
                <MenuItem selected={mainStatKey === ""} disabled={mainStatKey === ""} onClick={() => filterOptionDispatch({ mainStatKey: "" })}>
                  <ListItemIcon><Replay /></ListItemIcon>
                  <ListItemText>
                    <Trans t={t} i18nKey="ui:unselect" >Unselect</Trans>
                  </ListItemText>
                </MenuItem>
                <Divider />
                {allMainStatKeys.map(statKey =>
                  <MenuItem key={statKey} selected={mainStatKey === statKey} disabled={mainStatKey === statKey} onClick={() => filterOptionDispatch({ mainStatKey: statKey })} >
                    {Stat.getStatNameWithPercent(statKey)}
                  </MenuItem>)}
              </DropdownButton>
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
            </Grid>
            {/* right-right */}
            <Grid item xs={6} sx={{
              // select all excluding last
              "> *:nth-last-of-type(n+2)": { mb: 1 }
            }} >
              {/* substat filter */}
              {substats.map((substatKey, index) =>
                <DropdownButton fullWidth key={index} title={substatKey ? Stat.getStatNameWithPercent(substatKey) : t('editor.substat.substatFormat', { value: index + 1 })} color={substatKey ? "success" : "primary"}>
                  <MenuItem
                    selected={substatKey === ""}
                    disabled={substatKey === ""}
                    onClick={() => {
                      substats[index] = ""
                      filterOptionDispatch({ substats })
                    }}
                  >
                    <ListItemIcon>
                      <Replay />
                    </ListItemIcon>
                    <ListItemText>
                      <Trans t={t} i18nKey="editor.substat.noSubstat" >No Substat</Trans>
                    </ListItemText>
                  </MenuItem>
                  <Divider />
                  {allSubstats.filter(key => !substats.includes(key)).map(key =>
                    <MenuItem key={key}
                      onClick={() => {
                        substats[index] = key
                        filterOptionDispatch({ substats })
                      }}
                    >{Stat.getStatNameWithPercent(key)}</MenuItem>
                  )}
                </DropdownButton>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center">
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
          <Grid item xs={12} sm={12} md={6}>
            <Typography variant="caption" color="text.secondary"><Trans t={t} i18nKey="buttonHint">Note: the red buttons above only applies to <b>filtered artifacts</b></Trans></Typography>
          </Grid>
        </Grid>
      </CardContent>
    </CardDark>
  </Suspense>
}

function LocationDropdown({ title, onChange, selectedCharacterKey, dropdownProps }) {
  const database = useContext(DatabaseContext)
  const characterSheets = usePromise(CharacterSheet.getAll(), [])
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