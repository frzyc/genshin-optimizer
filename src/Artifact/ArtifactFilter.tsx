import { faBan, faChartLine, faTrash, faUserShield, faUserSlash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { BusinessCenter, Replay } from "@mui/icons-material"
import { Button, CardContent, Divider, Grid, ListItemIcon, ListItemText, MenuItem, Skeleton, Slider, ToggleButton, Typography } from "@mui/material"
import { Suspense, useContext, useMemo } from "react"
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
import { allMainStatKeys, allSubstats } from "../Types/artifact"
import { allArtifactRarities } from "../Types/consts"
import { clamp } from "../Util/Util"
import { initialFilter, sortKeys } from "./ArtifactFilterUtil"

export default function ArtifactFilter({ artifacts, filters, filterDispatch, ...props }) {
  const { t } = useTranslation(["artifact", "ui"]);
  const database = useContext(DatabaseContext)
  const { numDelete, numUnequip, numExclude, numInclude } = useMemo(() => {
    const numDelete = artifacts.reduce((a, art) => a + (art.lock ? 0 : 1), 0)
    const numUnequip = artifacts.reduce((a, art) => a + (art.location ? 1 : 0), 0)
    const numExclude = artifacts.reduce((a, art) => a + (art.exclude ? 1 : 0), 0)
    const numInclude = artifacts.length - numExclude
    return { numDelete, numUnequip, numExclude, numInclude }
  }, [artifacts])

  const { filterArtSetKey, filterSlotKey, filterMainStatKey, filterStars, filterLevelLow, filterLevelHigh, filterSubstats = initialFilter().filterSubstats,
    filterLocation = "", filterExcluded = "", sortType = sortKeys[0], ascending = false } = filters
  const locationCharacterSheet = usePromise(CharacterSheet.get(filterLocation), [filterLocation])

  let locationDisplay
  if (!filterLocation) locationDisplay = t("filterLocation.any")
  else if (filterLocation === "Inventory") locationDisplay = <span><BusinessCenter /> {t("filterLocation.inventory")}</span>
  else if (filterLocation === "Equipped") locationDisplay = <span><FontAwesomeIcon icon={faUserShield} /> {t("filterLocation.currentlyEquipped")}</span>
  else locationDisplay = <b>{locationCharacterSheet?.nameWIthIcon}</b>

  let excludedDisplay
  if (filterExcluded === "excluded") excludedDisplay = <span><FontAwesomeIcon icon={faBan} /> {t`exclusion.excluded`}</span>
  else if (filterExcluded === "included") excludedDisplay = <span><FontAwesomeIcon icon={faChartLine} /> {t`exclusion.included`}</span>
  else excludedDisplay = t("exclusionDisplay", { value: t("exclusion.any") })

  const unequipArtifacts = () =>
    window.confirm(`Are you sure you want to unequip ${numUnequip} artifacts currently equipped on characters?`) &&
    artifacts.map(art => database.setArtLocation(art.id!, ""))

  const deleteArtifacts = () =>
    window.confirm(`Are you sure you want to delete ${numDelete} artifacts?`) &&
    artifacts.map(art => !art.lock && database.removeArt(art.id!))

  const excludeArtifacts = () =>
    window.confirm(`Are you sure you want to exclude ${numInclude} artifacts from build generations?`) &&
    artifacts.map(art => database.updateArt({ exclude: true }, art.id))

  const includeArtifacts = () =>
    window.confirm(`Are you sure you want to include ${numExclude} artifacts in build generations?`) &&
    artifacts.map(art => database.updateArt({ exclude: false }, art.id))

  return <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
    <CardDark {...props} >
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
            <div><ArtifactSetDropdown hasUnselect selectedSetKey={filterArtSetKey} onChange={setKey => filterDispatch({ filterArtSetKey: setKey })} fullWidth /></div>
            {/* Artifact stars filter */}
            <SolidToggleButtonGroup fullWidth onChange={(e, newVal) => filterDispatch({ filterStars: newVal })} value={filterStars} size="small">
              {allArtifactRarities.map(star => <ToggleButton key={star} value={star}><Stars stars={star} /></ToggleButton>)}
            </SolidToggleButtonGroup>
            {/* Artiface level filter */}
            <CardLight sx={{ width: "100%", display: "flex", alignItems: "center" }}>
              <CustomNumberInput
                value={filterLevelLow}
                onChange={val => filterDispatch({ filterLevelLow: clamp(val, 0, filterLevelHigh) })}
                sx={{ pl: 2, width: 100, }}
                inputProps={{ sx: { textAlign: "center" } }}
                startAdornment={"Level: "}
              />
              <Slider sx={{ width: 100, flexGrow: 1, mx: 2 }}
                getAriaLabel={() => 'Arifact Level Range'}
                value={[filterLevelLow, filterLevelHigh]}
                onChange={(e, value) => filterDispatch({ filterLevelLow: value[0] ?? value, filterLevelHigh: value[1] ?? value })}
                valueLabelDisplay="auto"
                min={0} max={20} step={1} marks
              />
              <CustomNumberInput
                value={filterLevelHigh}
                onChange={val => filterDispatch({ filterLevelHigh: clamp(val, filterLevelLow, 20) })}
                sx={{ px: 1, width: 50, }}
                inputProps={{ sx: { textAlign: "center" } }}
              />
            </CardLight>
            {/* Sort */}
            <SortByButton fullWidth sortKeys={sortKeys}
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
              <ArtifactSlotDropdown fullWidth hasUnselect slotKey={filterSlotKey} onChange={filterSlotKey => filterDispatch({ filterSlotKey })} />
              {/* Main Stat filter */}
              <DropdownButton fullWidth title={Stat.getStatNameWithPercent(filterMainStatKey, t(`mainStat`))} color={filterMainStatKey ? "success" : "primary"}  >
                <MenuItem selected={filterMainStatKey === ""} disabled={filterMainStatKey === ""} onClick={() => filterDispatch({ filterMainStatKey: "" })}>
                  <ListItemIcon><Replay /></ListItemIcon>
                  <ListItemText>
                    <Trans t={t} i18nKey="ui:unselect" >Unselect</Trans>
                  </ListItemText>
                </MenuItem>
                <Divider />
                {allMainStatKeys.map(statKey =>
                  <MenuItem key={statKey} selected={filterMainStatKey === statKey} disabled={filterMainStatKey === statKey} onClick={() => filterDispatch({ filterMainStatKey: statKey })} >
                    {Stat.getStatNameWithPercent(statKey)}
                  </MenuItem>)}
              </DropdownButton>
              {/* location */}
              <LocationDropdown dropdownProps={{ color: filterLocation ? "success" : "primary" }} title={locationDisplay} onChange={filterLocation => filterDispatch({ filterLocation })} selectedCharacterKey={filterLocation} />
              {/* exclusion state */}
              <DropdownButton fullWidth title={excludedDisplay} color={filterExcluded ? (filterExcluded === "included" ? "success" : "error") : "primary"}>
                <MenuItem selected={filterExcluded === ""} disabled={filterExcluded === ""} onClick={() => filterDispatch({ filterExcluded: "" })}><Trans t={t} i18nKey="exclusion.any" >Any</Trans></MenuItem>
                <MenuItem selected={filterExcluded === "excluded"} disabled={filterExcluded === "excluded"} onClick={() => filterDispatch({ filterExcluded: "excluded" })}>
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faBan} />
                  </ListItemIcon>
                  <ListItemText>
                    <Trans t={t} i18nKey="exclusion.excluded" >Excluded</Trans>
                  </ListItemText>
                </MenuItem>
                <MenuItem selected={filterExcluded === "included"} disabled={filterExcluded === "included"} onClick={() => filterDispatch({ filterExcluded: "included" })}>
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
              {filterSubstats.map((substatKey, index) =>
                <DropdownButton fullWidth key={index} title={substatKey ? Stat.getStatNameWithPercent(substatKey) : t('editor.substat.substatFormat', { value: index + 1 })} color={substatKey ? "success" : "primary"}>
                  <MenuItem
                    selected={substatKey === ""}
                    disabled={substatKey === ""}
                    onClick={() => {
                      filterSubstats[index] = ""
                      filterDispatch({ filterSubstats })
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
                  {allSubstats.filter(key => !filterSubstats.includes(key)).map(key =>
                    <MenuItem key={key}
                      onClick={() => {
                        filterSubstats[index] = key
                        filterDispatch({ filterSubstats })
                      }}
                    >{Stat.getStatNameWithPercent(key)}</MenuItem>
                  )}
                </DropdownButton>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
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
              <Trans t={t} i18nKey="button.excludeArtifacts" >Lock Artifacts</Trans>
              <SqBadge sx={{ ml: 1 }} color={numInclude ? "success" : "secondary"}>{numInclude}</SqBadge>
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth color="error" disabled={!numExclude} onClick={includeArtifacts} startIcon={<FontAwesomeIcon icon={faChartLine} />}>
              <Trans t={t} i18nKey="button.includeArtifacts" >Unlock Artifacts</Trans>
              <SqBadge sx={{ ml: 1 }} color={numExclude ? "success" : "secondary"}>{numExclude}</SqBadge>
            </Button>
          </Grid>
        </Grid>
        <Typography variant="caption" color="text.secondary"><Trans t={t} i18nKey="buttonHint">Note: the above buttons only applies to <b>filtered artifacts</b></Trans></Typography>
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