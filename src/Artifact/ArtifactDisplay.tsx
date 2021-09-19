import { faBan, faBriefcase, faChartLine, faCheckSquare, faSortAmountDownAlt, faSortAmountUp, faSquare, faTrash, faUndo, faUserShield, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Card, Dropdown, InputGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import ReactGA from 'react-ga';
import { Trans, useTranslation } from 'react-i18next';
import { CharacterSelectionDropdownList } from '../Character/CharacterSelection';
import CharacterSheet from '../Character/CharacterSheet';
import CustomFormControl from '../Components/CustomFormControl';
import InfoComponent from '../Components/InfoComponent';
import { Stars } from '../Components/StarDisplay';
import { DatabaseContext } from '../Database/Database';
import { dbStorage } from '../Database/DBStorage';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import usePromise from '../ReactHooks/usePromise';
import Stat from '../Stat';
import { allMainStatKeys, allSubstats, ICachedArtifact, SubstatKey } from '../Types/artifact';
import { allArtifactRarities, allSlotKeys } from '../Types/consts';
import { clamp } from '../Util/Util';
import Artifact from './Artifact';
import ArtifactCard from './ArtifactCard';
import ArtifactEditor from './ArtifactEditor';
import { ArtifactSheet } from './ArtifactSheet';
import ArtifactSetDropDownMenuFragment from './Component/ArtifactSetDropDownMenuFragment';
import SlotNameWithIcon from './Component/SlotNameWIthIcon';

const InfoDisplay = React.lazy(() => import('./InfoDisplay'));
const sortKeys = ["quality", "level", "efficiency", "mefficiency"]

const initialFilter = () => ({
  filterArtSetKey: "",
  filterStars: [3, 4, 5],
  filterLevelLow: 0,
  filterLevelHigh: 20,
  filterSlotKey: "",
  filterMainStatKey: "",
  filterSubstats: ["", "", "", ""],
  filterLocation: "",
  filterExcluded: "",
  ascending: false,
  sortType: sortKeys[0],
  maxNumArtifactsToDisplay: 50,
  effFilter: [...allSubstats]
})
function filterReducer(state, action) {
  //reset all except the efficiency filter, since its a separate UI with its own reset
  if (action.type === "reset") return { ...initialFilter(), effFilter: state.effFilter }
  return { ...state, ...action }
}
function filterInit(initial = initialFilter()) {
  return { ...initial, ...(dbStorage.get("ArtifactDisplay.state") ?? {}) }
}
export default function ArtifactDisplay(props) {
  const { t } = useTranslation(["artifact", "ui"]);
  const database = useContext(DatabaseContext)
  const [filters, filterDispatch] = useReducer(filterReducer, initialFilter(), filterInit)
  const { effFilter } = filters
  const [artToEditId, setartToEditId] = useState(props?.location?.artToEditId)
  const [pageIdex, setpageIdex] = useState(0)
  const scrollRef = useRef(null)
  const invScrollRef = useRef(null)
  const [dbDirty, forceUpdate] = useForceUpdate()
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])
  const effFilterSet = useMemo(() => new Set(effFilter), [effFilter]) as Set<SubstatKey>
  const deleteArtifact = useCallback(
    (id: string) => database.removeArt(id), [database])
  const editArtifact = useCallback(
    id => {
      setartToEditId(id);
      (scrollRef?.current as any)?.scrollIntoView({ behavior: "smooth" })
    }, [])
  const cancelEditArtifact = useCallback(() => setartToEditId(null), [])

  useEffect(() => {
    ReactGA.pageview('/artifact')
    return database.followAnyArt(forceUpdate)
  }, [database, forceUpdate])

  useEffect(() => {
    dbStorage.set("ArtifactDisplay.state", filters)
  }, [filters])

  const { artifacts, totalArtNum, numUnequip, numInclude, numExclude } = useMemo(() => {
    const { filterArtSetKey, filterSlotKey, filterMainStatKey, filterStars, filterLevelLow, filterLevelHigh, filterSubstats = initialFilter().filterSubstats, filterLocation = "", filterExcluded = "", sortType = sortKeys[0], ascending = false } = filters
    const allArtifacts = database._getArts()
    const artifacts: ICachedArtifact[] = allArtifacts.filter(art => {
      if (filterExcluded) {
        if (filterExcluded === "excluded" && !art.exclude) return false
        if (filterExcluded === "included" && art.exclude) return false
      }
      if (filterLocation === "Inventory") {
        if (art.location) return false;
      } else if (filterLocation === "Equipped") {
        if (!art.location) return false;
      } else if (filterLocation && filterLocation !== art.location) return false;

      if (filterArtSetKey && filterArtSetKey !== art.setKey) return false;
      if (filterSlotKey && filterSlotKey !== art.slotKey) return false
      if (filterMainStatKey && filterMainStatKey !== art.mainStatKey) return false
      if (art.level < filterLevelLow || art.level > filterLevelHigh) return false;
      if (!filterStars.includes(art.rarity)) return false;
      for (const filterKey of filterSubstats)
        if (filterKey && !art.substats.some(substat => substat.key === filterKey)) return false;
      return true
    }).map((art) => {
      switch (sortType) {
        case "quality": return { value: [art.rarity], art }
        case "level": return { value: [art.level, art.rarity], art }
        case "efficiency": return { value: [Artifact.getArtifactEfficiency(art, effFilterSet).currentEfficiency], art }
        case "mefficiency": return { value: [Artifact.getArtifactEfficiency(art, effFilterSet).maxEfficiency], art }
      }
      return { value: [0], art }
    }).sort((a, b) => {
      for (let i = 0; i < a.value.length; i++) {
        if (a.value[i] !== b.value[i])
          return (a.value[i] - b.value[i]) * (ascending ? 1 : -1)
      }
      return 0
    }).map(item => item.art)
    const numUnequip = artifacts.reduce((a, art) => a + (art.location ? 1 : 0), 0)
    const numExclude = artifacts.reduce((a, art) => a + (art.exclude ? 1 : 0), 0)
    const numInclude = artifacts.length - numExclude

    return { artifacts, totalArtNum: allArtifacts.length, numInclude, numExclude, numUnequip, ...dbDirty }//use dbDirty to shoo away warnings!
  }, [filters, dbDirty, effFilterSet, database])

  const { filterArtSetKey, filterSlotKey, filterMainStatKey, filterStars, filterLevelLow, filterLevelHigh, filterSubstats = initialFilter().filterSubstats, maxNumArtifactsToDisplay, filterLocation = "", filterExcluded = "", sortType = sortKeys[0], ascending = false } = filters

  const { artifactsToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(artifacts.length / maxNumArtifactsToDisplay)
    const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
    return { artifactsToShow: artifacts.slice(currentPageIndex * maxNumArtifactsToDisplay, (currentPageIndex + 1) * maxNumArtifactsToDisplay), numPages, currentPageIndex }
  }, [artifacts, pageIdex, maxNumArtifactsToDisplay])

  const locationCharacterSheet = usePromise(CharacterSheet.get(filterLocation), [filterLocation])
  let locationDisplay
  if (!filterLocation) locationDisplay = t("filterLocation.any")
  else if (filterLocation === "Inventory") locationDisplay = <span><FontAwesomeIcon icon={faBriefcase} /> {t("filterLocation.inventory")}</span>
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
    window.confirm(`Are you sure you want to delete ${artifacts.length} artifacts?`) &&
    artifacts.map(art => database.removeArt(art.id!))

  const excludeArtifacts = () =>
    window.confirm(`Are you sure you want to exclude ${numInclude} artifacts from build generations?`) &&
    artifacts.map(art => database.updateArt({ exclude: true }, art.id))

  const includeArtifacts = () =>
    window.confirm(`Are you sure you want to include ${numExclude} artifacts in build generations?`) &&
    artifacts.map(art => database.updateArt({ exclude: false }, art.id))

  const paginationCard = useMemo(() => {
    const showingValue = artifacts.length !== totalArtNum ? `${artifacts.length}/${totalArtNum}` : `${totalArtNum}`
    return <Card bg="darkcontent" text={"lightfont" as any} className="mb-2">
      <Card.Body>
        <Row>
          <Col>
            <ButtonGroup size="sm">
              {[...Array(numPages).keys()].map(i => <Button key={i} className="px-3" variant={currentPageIndex === i ? "success" : "primary"} onClick={() => {
                setpageIdex(i);
                (invScrollRef.current as any)?.scrollIntoView({ behavior: "smooth" })
              }} >
                {i === 0 ? "Page " : ""}{i + 1}
              </Button>)}
            </ButtonGroup>
          </Col>
          <Col xs="auto"><Trans t={t} i18nKey="showingNum" count={artifactsToShow.length} value={showingValue} >Showing <b>{{ count: artifactsToShow.length }}</b> out of {{ value: showingValue }} Artifacts</Trans></Col>
        </Row>
      </Card.Body>
    </Card>
  }, [numPages, currentPageIndex, artifactsToShow.length, artifacts.length, totalArtNum, t])

  return <Container className="mt-2" >
    <InfoComponent
      pageKey="artifactPage"
      modalTitle={t`info.title`}
      text={t("tipsOfTheDay", { returnObjects: true }) as string[]}
    >
      <InfoDisplay />
    </InfoComponent>
    <div className="mb-2" ref={scrollRef}>
      <ArtifactEditor
        artifactIdToEdit={artToEditId}
        cancelEdit={cancelEditArtifact}
      />
    </div>
    <Card bg="darkcontent" text={"lightfont" as any} className="mb-2" ref={invScrollRef}>
      <Card.Header>
        <Row>
          <Col><span><Trans t={t} i18nKey="artifactFilter">Artifact Filter</Trans></span></Col>
          <Col xs="auto"><Button size="sm" className="ml-2" variant="danger" onClick={() => filterDispatch({ type: "reset" })} ><FontAwesomeIcon icon={faUndo} className="fa-fw" /> <Trans t={t} i18nKey="resetFilters" /></Button></Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Row>
          {/* Left half */}
          <Col xs={12} lg={6}>
            {/* Artifact set filter */}
            <Dropdown as={InputGroup.Prepend} className="flex-grow-1 mb-2">
              <Dropdown.Toggle className="w-100" variant={filterArtSetKey ? "success" : "primary"}>
                {artifactSheets?.[filterArtSetKey]?.name ?? t('editor.set.artifactSet')}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => filterDispatch({ filterArtSetKey: "" })}><Trans t={t} i18nKey="ui:unselect" >Unselect</Trans></Dropdown.Item>
                <Dropdown.Divider />
                <ArtifactSetDropDownMenuFragment sheets={artifactSheets} click={(filterArtSetKey => filterDispatch({ filterArtSetKey }))} />
              </Dropdown.Menu>
            </Dropdown>

            {/* Artifact stars filter */}
            <ToggleButtonGroup className="w-100 d-flex mb-2" type="checkbox" as={InputGroup.Append} onChange={(e) => filterDispatch({ filterStars: e })} value={filterStars}>
              {allArtifactRarities.map(star => {
                let selected = filterStars.includes(star)
                return <ToggleButton key={star} value={star} variant={selected ? "success" : "primary"}><FontAwesomeIcon icon={selected ? faCheckSquare : faSquare} /> <Stars stars={star} /></ToggleButton>
              })}
            </ToggleButtonGroup>

            {/* Artiface level filter */}
            <InputGroup className="mb-2">
              <InputGroup.Prepend>
                <InputGroup.Text>
                  <span>
                    <Trans t={t} i18nKey="filterLevelFormat">
                      Level <span className={`text-${filterLevelLow > 0 ? "success" : ""}`}>Low</span>/<span className={`text-${filterLevelHigh < 20 ? "success" : ""}`}>High</span> (Inclusive)
                    </Trans>
                  </span>
                </InputGroup.Text>
              </InputGroup.Prepend>
              <CustomFormControl
                value={filterLevelLow}
                placeholder={t('ui:game.minLevel')}
                onChange={val => filterDispatch({ filterLevelLow: clamp(val, 0, filterLevelHigh) })}
              />
              <CustomFormControl
                value={filterLevelHigh}
                placeholder={t('ui:game.maxLevel')}
                onChange={val => filterDispatch({ filterLevelHigh: clamp(val, filterLevelLow, 20) })}
              />
            </InputGroup>

            {/* Sort */}
            <ButtonGroup className="w-100 d-flex flex-row mb-2">
              <Dropdown as={ButtonGroup} className="flex-grow-1">
                <Dropdown.Toggle >
                  <span>
                    <Trans t={t} i18nKey="ui:sortByFormat" value={t(`sortMap.${sortType}`) as any}>Sort By: {{ value: t(`sortMap.${sortType}`) }}</Trans>
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {sortKeys.map(key =>
                    <Dropdown.Item key={key} onClick={() => filterDispatch({ sortType: key })}>{t(`sortMap.${key}`) as any}</Dropdown.Item>)}
                </Dropdown.Menu>
              </Dropdown>
              <Button onClick={() => filterDispatch({ ascending: !ascending })} className="flex-shrink-1">
                <FontAwesomeIcon icon={ascending ? faSortAmountDownAlt : faSortAmountUp} className="fa-fw" /><span> {ascending ? <Trans t={t} i18nKey="ui:ascending" >Ascending</Trans> : <Trans t={t} i18nKey="ui:descending" >Descending</Trans>}</span>
              </Button>
            </ButtonGroup>
          </Col>
          {/* Right half */}
          <Col xs={12} lg={6}>
            <Row>
              {/* Left */}
              <Col>
                {/* Artifact Slot */}
                <Dropdown className="flex-grow-1 mb-2">
                  <Dropdown.Toggle className="w-100" variant={filterSlotKey ? "success" : "primary"}>
                    {filterSlotKey ? <SlotNameWithIcon slotKey={filterSlotKey} /> : t('slot')}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => filterDispatch({ filterSlotKey: "" })} ><Trans t={t} i18nKey="ui:unselect" >Unselect</Trans></Dropdown.Item>
                    {allSlotKeys.map(key =>
                      <Dropdown.Item key={key} onClick={() => filterDispatch({ filterSlotKey: key })} ><SlotNameWithIcon slotKey={key} /></Dropdown.Item>)}
                  </Dropdown.Menu>
                </Dropdown>
                {/* Main Stat filter */}
                <Dropdown className="flex-grow-1 mb-2">
                  <Dropdown.Toggle className="w-100" variant={filterMainStatKey ? "success" : "primary"}>
                    {Stat.getStatNameWithPercent(filterMainStatKey, t(`mainStat`))}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => filterDispatch({ filterMainStatKey: "" })}><Trans t={t} i18nKey="ui:unselect" >Unselect</Trans></Dropdown.Item>
                    {allMainStatKeys.map(statKey => <Dropdown.Item key={statKey} onClick={() => filterDispatch({ filterMainStatKey: statKey })} >
                      {Stat.getStatNameWithPercent(statKey)}
                    </Dropdown.Item>)}
                  </Dropdown.Menu>
                </Dropdown>

                {/* location */}
                <Dropdown className="flex-grow-1 mb-2" >
                  <Dropdown.Toggle className="w-100" variant={filterLocation ? "success" : "primary"} >
                    {locationDisplay}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => filterDispatch({ filterLocation: "" })}><Trans t={t} i18nKey="ui:unselect" >Unselect</Trans></Dropdown.Item>
                    <Dropdown.Item onClick={() => filterDispatch({ filterLocation: "Inventory" })}><FontAwesomeIcon icon={faBriefcase} /> <Trans t={t} i18nKey="filterLocation.inventory" >Inventory</Trans></Dropdown.Item>
                    <Dropdown.Item onClick={() => filterDispatch({ filterLocation: "Equipped" })}><FontAwesomeIcon icon={faUserShield} /> <Trans t={t} i18nKey="filterLocation.currentlyEquipped" >Currently Equipped</Trans></Dropdown.Item>
                    <Dropdown.Divider />
                    <CharacterSelectionDropdownList onSelect={cid => filterDispatch({ filterLocation: cid })} />
                  </Dropdown.Menu>
                </Dropdown>

                {/* locked state */}
                <Dropdown className="flex-grow-1 mb-2" >
                  <Dropdown.Toggle className="w-100" variant={filterExcluded ? "success" : "primary"} >
                    {excludedDisplay}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => filterDispatch({ filterExcluded: "" })}><Trans t={t} i18nKey="exclusion.any" >Any</Trans></Dropdown.Item>
                    <Dropdown.Item onClick={() => filterDispatch({ filterExcluded: "excluded" })}><span><FontAwesomeIcon icon={faBan} /> <Trans t={t} i18nKey="exclusion.excluded" >Excluded</Trans></span></Dropdown.Item>
                    <Dropdown.Item onClick={() => filterDispatch({ filterExcluded: "included" })}><span><FontAwesomeIcon icon={faChartLine} /> <Trans t={t} i18nKey="exclusion.included" >Included</Trans></span></Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              {/* Right */}
              <Col>
                {/* substat filter */}
                {filterSubstats.map((substatKey, index) =>
                  <Dropdown className="mb-2" key={index}>
                    <Dropdown.Toggle id="dropdown-basic" className="w-100" variant={substatKey ? "success" : "primary"}>
                      {substatKey ? Stat.getStatNameWithPercent(substatKey) : t('editor.substat.substatFormat', { value: index + 1 })}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => {
                          filterSubstats[index] = ""
                          filterDispatch({ filterSubstats })
                        }}
                      ><Trans t={t} i18nKey="editor.substat.noSubstat" >No Substat</Trans></Dropdown.Item>
                      {Artifact.getSubstatKeys().filter(key => !filterSubstats.includes(key)).map(key =>
                        <Dropdown.Item key={key}
                          onClick={() => {
                            filterSubstats[index] = key
                            filterDispatch({ filterSubstats })
                          }}
                        >{Stat.getStatNameWithPercent(key)}</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mb-n2">
          <Col xs={6} lg={3} className="mb-2"><Button className="w-100" variant="danger" disabled={!numUnequip} onClick={unequipArtifacts}><FontAwesomeIcon icon={faUserSlash} /> <Trans t={t} i18nKey="button.unequipArtifacts" >Unequip Artifacts</Trans></Button></Col>
          <Col xs={6} lg={3} className="mb-2"><Button className="w-100" variant="danger" disabled={!artifacts.length} onClick={deleteArtifacts}><FontAwesomeIcon icon={faTrash} /> <Trans t={t} i18nKey="button.deleteArtifacts" >Delete Artifacts</Trans></Button></Col>
          <Col xs={6} lg={3} className="mb-2"><Button className="w-100" variant="danger" disabled={!numInclude} onClick={excludeArtifacts}><FontAwesomeIcon icon={faBan} /> <Trans t={t} i18nKey="button.excludeArtifacts" >Lock Artifacts</Trans></Button></Col>
          <Col xs={6} lg={3} className="mb-2"><Button className="w-100" variant="danger" disabled={!numExclude} onClick={includeArtifacts}><FontAwesomeIcon icon={faChartLine} /> <Trans t={t} i18nKey="button.includeArtifacts" >Unlock Artifacts</Trans></Button></Col>
          <Col xs={12} className="mt-n2"><small><Trans t={t} i18nKey="buttonHint">Note: the above buttons only applies to <b>filtered artifacts</b></Trans></small></Col>
        </Row>
      </Card.Body>
    </Card>
    <Card bg="darkcontent" text={"lightfont" as any} className="mb-2" ref={invScrollRef}>
      <Card.Header>
        <Row>
          <Col><span><Trans t={t} i18nKey="efficiencyFilter.title">Efficiency Filter</Trans></span></Col>
          <Col xs="auto"><Button size="sm" className="ml-2" variant="danger" onClick={() => filterDispatch({ effFilter: [...allSubstats] })} ><FontAwesomeIcon icon={faUndo} className="fa-fw" /> <Trans t={t} i18nKey="ui:reset" /></Button></Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <ButtonToolbar as={Row} className="w-100 d-flex flex-row">
          {[[0, 6], [6]].map(slicep => <ToggleButtonGroup key={slicep.toString()} as={Col} type="checkbox" value={effFilter} onChange={n => filterDispatch({ effFilter: n })} className="flex-grow-1 mb-2">
            {allSubstats.slice(...slicep).map(substat => <ToggleButton key={substat} value={substat} variant={effFilter.includes(substat) ? "success" : "primary"}>{Stat.getStatNameWithPercent(substat)}</ToggleButton>)}
          </ToggleButtonGroup>)}
        </ButtonToolbar>
      </Card.Body>
    </Card>
    {paginationCard}
    <Row>
      {artifactsToShow.map((art, i) =>
        <Col key={i} lg={4} md={6} className="mb-2">
          <ArtifactCard
            artifactId={art.id}
            effFilter={effFilterSet}
            onDelete={() => deleteArtifact(art.id)}
            onEdit={() => editArtifact(art.id)}
          />
        </Col>
      )}
    </Row>
    {numPages > 1 && paginationCard}
  </Container >
}
