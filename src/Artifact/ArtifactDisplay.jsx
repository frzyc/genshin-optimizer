import { faCheckSquare, faLock, faLockOpen, faSortAmountDownAlt, faSortAmountUp, faSquare, faTrash, faUndo, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Button, ButtonGroup, Card, Dropdown, InputGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import ReactGA from 'react-ga';
import Character from '../Character/Character';
import { CharacterSelectionDropdownList } from '../Components/CharacterSelection';
import CustomFormControl from '../Components/CustomFormControl';
import { Stars } from '../Components/StarDisplay';
import ArtifactDatabase from '../Database/ArtifactDatabase';
import CharacterDatabase from '../Database/CharacterDatabase';
import InfoComponent from '../InfoComponent';
import Stat from '../Stat';
import { useForceUpdate } from '../Util/ReactUtil';
import { clamp, loadFromLocalStorage, saveToLocalStorage } from '../Util/Util';
import Artifact from './Artifact';
import ArtifactCard from './ArtifactCard';
import ArtifactEditor from './ArtifactEditor';

const ArtifactDisplayInfo = React.lazy(() => import('./ArtifactDisplayInfo'));
const sortMap = {
  quality: "Quality",
  level: "Level",
  efficiency: "Current Substat Eff.",
  mefficiency: "Maximum Substat Eff."
}

const initialFilter = () => ({
  filterArtSetKey: "",
  filterStars: [3, 4, 5],
  filterLevelLow: 0,
  filterLevelHigh: 20,
  filterSlotKey: "",
  filterMainStatKey: "",
  filterSubstats: ["", "", "", ""],
  filterLocation: "",
  filterLocked: "",
  ascending: false,
  sortType: Object.keys(sortMap)[0],
  maxNumArtifactsToDisplay: 50
})
function filterReducer(state, action) {
  if (action.type === "reset") return initialFilter()
  return { ...state, ...action }
}
function filterInit(initial = initialFilter()) {
  return { ...initial, ...(loadFromLocalStorage("ArtifactDisplay.state") ?? {}) }
}
export default function ArtifactDisplay(props) {
  const [filters, filterDispatch] = useReducer(filterReducer, initialFilter(), filterInit)
  const [artToEditId, setartToEditId] = useState(props?.location?.artToEditId)
  const [pageIdex, setpageIdex] = useState(0)
  const scrollRef = useRef(null)
  const invScrollRef = useRef(null)
  const forceUpdateArtifactDisplay = useForceUpdate()
  const [dbDirty, setdbDirty] = useState({})
  const deleteArtifact = useCallback(
    id => {
      const art = ArtifactDatabase.get(id);
      if (art && art.location)
        CharacterDatabase.unequipArtifactOnSlot(art.location, art.slotKey);
      ArtifactDatabase.removeArtifactById(id)
    }, [])
  const editArtifact = useCallback(
    id => {
      setartToEditId(id)
      scrollRef?.current?.scrollIntoView({ behavior: "smooth" })
    }, [])
  const cancelEditArtifact = useCallback(() => setartToEditId(null), [])

  useEffect(() => {
    ReactGA.pageview('/artifact')
    const handleDbDirty = () => setdbDirty({})
    Character.getCharacterDataImport()?.then(forceUpdateArtifactDisplay)
    Artifact.getDataImport()?.then(forceUpdateArtifactDisplay)
    ArtifactDatabase.registerListener(handleDbDirty)
    return () => ArtifactDatabase.unregisterListener(handleDbDirty)
  }, [forceUpdateArtifactDisplay])

  useEffect(() => {
    saveToLocalStorage("ArtifactDisplay.state", filters)
  }, [filters])

  const { artifacts, totalArtNum, numUnequip, numUnlock, numLock } = useMemo(() => {
    const { filterArtSetKey, filterSlotKey, filterMainStatKey, filterStars, filterLevelLow, filterLevelHigh, filterSubstats = initialFilter().filterSubstats, filterLocation = "", filterLocked = "", sortType = Object.keys(sortMap)[0], ascending = false } = filters
    const artifactDB = ArtifactDatabase.getArtifactDatabase() || {}
    const artifacts = Object.values(artifactDB).filter(art => {
      if (filterLocked) {
        if (filterLocked === "locked" && !art.lock) return false
        if (filterLocked === "unlocked" && art.lock) return false
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
      if (!filterStars.includes(art.numStars)) return false;
      for (const filterKey of filterSubstats)
        if (filterKey && !art.substats.some(substat => substat.key === filterKey)) return false;
      return true
    }).sort((a, b) => {
      let sortNum = 0
      switch (sortType) {
        case "quality":
          sortNum = a.numStars - b.numStars
          if (sortNum === 0)
            sortNum = a.level - b.level
          break;
        case "level":
          sortNum = a.level - b.level
          if (sortNum === 0)
            sortNum = a.numStars - b.numStars
          break;
        case "efficiency":
          sortNum = a.currentEfficiency - b.currentEfficiency
          break;
        case "mefficiency":
          sortNum = a.maximumEfficiency - b.maximumEfficiency
          break;
        default:
          break;
      }
      return sortNum * (ascending ? 1 : -1)
    })
    const numUnequip = artifacts.reduce((a, art) => a + (art.location ? 1 : 0), 0)
    const numUnlock = artifacts.reduce((a, art) => a + (art.lock ? 1 : 0), 0)
    const numLock = artifacts.length - numUnlock

    return { artifacts, totalArtNum: Object.keys(artifactDB)?.length || 0, numUnequip, numUnlock, numLock, ...dbDirty }//use dbDirty to shoo away warnings!
  }, [filters, dbDirty])

  const { filterArtSetKey, filterSlotKey, filterMainStatKey, filterStars, filterLevelLow, filterLevelHigh, filterSubstats = initialFilter().filterSubstats, maxNumArtifactsToDisplay, filterLocation = "", filterLocked = "", sortType = Object.keys(sortMap)[0], ascending = false } = filters

  const { artifactsToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(artifacts.length / maxNumArtifactsToDisplay)
    const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
    return { artifactsToShow: artifacts.slice(currentPageIndex * maxNumArtifactsToDisplay, (currentPageIndex + 1) * maxNumArtifactsToDisplay), numPages, currentPageIndex }
  }, [artifacts, pageIdex, maxNumArtifactsToDisplay])

  let locationDisplay
  if (!filterLocation) locationDisplay = <span>Location: Any</span>
  else if (filterLocation === "Inventory") locationDisplay = <span>Location: Inventory</span>
  else if (filterLocation === "Equipped") locationDisplay = <span>Location: Equipped</span>
  else locationDisplay = <b>{Character.getName(filterLocation)}</b>

  let lockedDisplay
  if (filterLocked === "locked") lockedDisplay = <span><FontAwesomeIcon icon={faLock} /> Locked</span>
  else if (filterLocked === "unlocked") lockedDisplay = <span><FontAwesomeIcon icon={faLockOpen} /> Unlocked</span>
  else lockedDisplay = <span>Locked: Any</span>

  const unequipArtifacts = () =>
    window.confirm(`Are you sure you want to unequip ${numUnequip} artifacts currently equipped on characters?`) &&
    artifacts.map(art => Artifact.unequipArtifact(art.id))

  const deleteArtifacts = () =>
    window.confirm(`Are you sure you want to delete ${artifacts.length} artifacts?`) &&
    artifacts.map(art => ArtifactDatabase.removeArtifactById(art.id))

  const lockArtifacts = () =>
    window.confirm(`Are you sure you want to lock ${numLock} artifacts?`) &&
    artifacts.map(art => ArtifactDatabase.setLocked(art.id, true))

  const unlockArtifacts = () =>
    window.confirm(`Are you sure you want to unlock ${numUnlock} artifacts?`) &&
    artifacts.map(art => ArtifactDatabase.setLocked(art.id, false))


  return <Container className="mt-2" >
    <InfoComponent
      pageKey="artifactPage"
      modalTitle="Artifact Editing/Management Page Info"
      text={["The maximum efficiency of a 4 star artifact is around 60%.",
        "The maximum efficiency of an artifact will usually decrease as you upgrade. It's perfectly normal!",
        "Substats with \"1\"s are the hardest to scan in screenshots.",
        "If all your rolls(6) went into a single substat, it will be purple!",
        "Click on \"Details\" when you are upgrading your artifacts in game to scan as you upgrade.",
        "You can now upload mutiple artifact screenshots to scan!"]}
    >
      <ArtifactDisplayInfo />
    </InfoComponent>
    <div className="mb-2" ref={scrollRef}>
      <ArtifactEditor
        artifactIdToEdit={artToEditId}
        cancelEdit={cancelEditArtifact}
      />
    </div>
    <Card bg="darkcontent" text="lightfont" className="mb-2" ref={invScrollRef}>
      <Card.Header>
        <Row>
          <Col><span>Artifact Filter</span></Col>
          <Col xs="auto"><Button size="sm" className="ml-2" variant="danger" onClick={() => filterDispatch({ type: "reset" })} ><FontAwesomeIcon icon={faUndo} className="fa-fw" /> Reset Filters</Button></Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Row className="mb-n2">
          {/* Artifact set filter */}
          <Col xs={12} lg={6} className="mb-2">
            <Dropdown as={InputGroup.Prepend} className="flex-grow-1">
              <Dropdown.Toggle className="w-100" variant={filterArtSetKey ? "success" : "primary"}>
                {Artifact.getSetName(filterArtSetKey, "Artifact Set")}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => filterDispatch({ filterArtSetKey: "" })}>Unselect</Dropdown.Item>
                {[5, 4, 3].map(star =>
                  <React.Fragment key={star}>
                    <Dropdown.Divider />
                    <Dropdown.ItemText>Max Rarity <Stars stars={star} /></Dropdown.ItemText>
                    {Artifact.getSetsByMaxStarEntries(star).map(([key, setobj]) =>
                      <Dropdown.Item key={key} onClick={() => filterDispatch({ filterArtSetKey: key })}>
                        {setobj.name}
                      </Dropdown.Item >)}
                  </React.Fragment>)}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          {/* Artifact stars filter */}
          <Col xs={12} lg={6} className="mb-2">
            <ToggleButtonGroup className="w-100 d-flex" type="checkbox" as={InputGroup.Append} onChange={(e) => filterDispatch({ filterStars: e })} value={filterStars}>
              {Artifact.getStars().map(star => {
                let selected = filterStars.includes(star)
                return <ToggleButton key={star} value={star} variant={selected ? "success" : "primary"}><FontAwesomeIcon icon={selected ? faCheckSquare : faSquare} /> <Stars stars={star} /></ToggleButton>
              })}
            </ToggleButtonGroup>
          </Col>
          {/* Artiface level filter */}
          <Col xs={12} lg={6} className="mb-2">
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text><span>Level <span className={`text-${filterLevelLow > 0 ? "success" : ""}`}>Low</span>/<span className={`text-${filterLevelHigh < 20 ? "success" : ""}`}>High</span> (Inclusive)</span></InputGroup.Text>
              </InputGroup.Prepend>
              <CustomFormControl
                value={filterLevelLow}
                placeholder={`Min Level`}
                onChange={val => filterDispatch({ filterLevelLow: clamp(val, 0, filterLevelHigh) })}
              />
              <CustomFormControl
                value={filterLevelHigh}
                placeholder={`Max Level`}
                onChange={val => filterDispatch({ filterLevelHigh: clamp(val, filterLevelLow, 20) })}
              />
            </InputGroup>
          </Col>
          {/* Artifact Slot */}
          <Col xs={6} lg={3} className="mb-2">
            <Dropdown className="flex-grow-1">
              <Dropdown.Toggle className="w-100" variant={filterSlotKey ? "success" : "primary"}>
                {Artifact.getSlotNameWithIcon(filterSlotKey, "Slot")}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => filterDispatch({ filterSlotKey: "" })} >Unselect</Dropdown.Item>
                {Artifact.getSlotKeys().map(key =>
                  <Dropdown.Item key={key} onClick={() => filterDispatch({ filterSlotKey: key })} >
                    {Artifact.getSlotNameWithIcon(key)}
                  </Dropdown.Item>)}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          {/* Main Stat filter */}
          <Col xs={6} lg={3} className="mb-2">
            <Dropdown className="flex-grow-1">
              <Dropdown.Toggle className="w-100" variant={filterMainStatKey ? "success" : "primary"}>
                {Stat.getStatNameWithPercent(filterMainStatKey, "Main Stat")}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => filterDispatch({ filterMainStatKey: "" })}>Unselect</Dropdown.Item>
                {Artifact.getMainStatKeys().map((statKey) => <Dropdown.Item key={statKey} onClick={() => filterDispatch({ filterMainStatKey: statKey })} >
                  {Stat.getStatNameWithPercent(statKey)}
                </Dropdown.Item>)}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          {/* substat filter */}
          {filterSubstats.map((substatKey, index) =>
            <Col key={index} xs={6} lg={3} className="mb-2">
              <Dropdown >
                <Dropdown.Toggle id="dropdown-basic" className="w-100" variant={substatKey ? "success" : "primary"}>
                  {Stat.getStatNameWithPercent(substatKey, `Substat ${index + 1}`)}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => {
                      filterSubstats[index] = ""
                      filterDispatch({ filterSubstats })
                    }}
                  >No Substat</Dropdown.Item>
                  {Artifact.getSubStatKeys().filter(key => !filterSubstats.includes(key)).map(key =>
                    <Dropdown.Item key={key}
                      onClick={() => {
                        filterSubstats[index] = key
                        filterDispatch({ filterSubstats })
                      }}
                    >{Stat.getStatNameWithPercent(key)}</Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          )}
          {/* location */}
          <Col xs={6} lg={3} className="mb-2">
            <Dropdown className="flex-grow-1" >
              <Dropdown.Toggle className="w-100" variant={filterLocation ? "success" : "primary"} >
                {locationDisplay}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => filterDispatch({ filterLocation: "" })}>Unselect</Dropdown.Item>
                <Dropdown.Item onClick={() => filterDispatch({ filterLocation: "Inventory" })}>Inventory</Dropdown.Item>
                <Dropdown.Item onClick={() => filterDispatch({ filterLocation: "Equipped" })}>Currently Equipped</Dropdown.Item>
                <Dropdown.Divider />
                <CharacterSelectionDropdownList onSelect={cid => filterDispatch({ filterLocation: cid })} />
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          <Col xs={6} lg={3} className="mb-2">
            <Dropdown className="flex-grow-1" >
              <Dropdown.Toggle className="w-100" variant={filterLocked ? "success" : "primary"} >
                {lockedDisplay}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => filterDispatch({ filterLocked: "" })}>Any</Dropdown.Item>
                <Dropdown.Item onClick={() => filterDispatch({ filterLocked: "locked" })}><span><FontAwesomeIcon icon={faLock} /> Locked</span></Dropdown.Item>
                <Dropdown.Item onClick={() => filterDispatch({ filterLocked: "unlocked" })}><span><FontAwesomeIcon icon={faLockOpen} /> Unlocked</span></Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          {/* Sort */}
          <Col xs={12} lg={6} className="mb-2">
            <ButtonGroup className="w-100 d-flex flex-row">
              <Dropdown as={ButtonGroup} className="flex-grow-1">
                <Dropdown.Toggle >
                  <span>Sort By: {sortMap[sortType]}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {Object.entries(sortMap).map(([key, name]) =>
                    <Dropdown.Item key={key} onClick={() => filterDispatch({ sortType: key })}>{name}</Dropdown.Item>)}
                </Dropdown.Menu>
              </Dropdown>
              <Button onClick={() => filterDispatch({ ascending: !ascending })} className="flex-shrink-1">
                <FontAwesomeIcon icon={ascending ? faSortAmountDownAlt : faSortAmountUp} className="fa-fw" /><span> {ascending ? "Ascending" : "Descending"}</span>
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
    <Card bg="darkcontent" text="lightfont" className="mb-2">
      <Card.Body>
        <Row className="mb-2">
          <Col xs={6} lg={3} className="mb-2"><Button className="w-100" variant="danger" disabled={!numUnequip} onClick={unequipArtifacts}><FontAwesomeIcon icon={faUserSlash} /> Unequip Artifacts</Button></Col>
          <Col xs={6} lg={3} className="mb-2"><Button className="w-100" variant="danger" disabled={!artifacts.length} onClick={deleteArtifacts}><FontAwesomeIcon icon={faTrash} /> Delete Artifacts</Button></Col>
          <Col xs={6} lg={3} className="mb-2"><Button className="w-100" variant="danger" disabled={!numLock} onClick={lockArtifacts}><FontAwesomeIcon icon={faLock} /> Lock Artifacts</Button></Col>
          <Col xs={6} lg={3} className="mb-2"><Button className="w-100" variant="danger" disabled={!numUnlock} onClick={unlockArtifacts}><FontAwesomeIcon icon={faLockOpen} /> Unlock Artifacts </Button></Col>
          <Col xs={12} className="mt-n2"><small>Note: the above buttons only applies to <b>filtered artifacts</b></small></Col>
        </Row>
        <Row>
          <Col>
            {numPages > 1 && <ButtonGroup size="sm">
              {[...Array(numPages).keys()].map(i => <Button key={i} className="px-3" variant={currentPageIndex === i ? "success" : "primary"} onClick={() => setpageIdex(i)} >
                {i === 0 ? "Page " : ""}{i + 1}
              </Button>)}
            </ButtonGroup>}
          </Col>
          <Col xs="auto"><span className="float-right text-right">Showing <b>{artifactsToShow.length}</b> out of {artifacts.length !== totalArtNum ? `${artifacts.length}/` : ""}{totalArtNum} Artifacts</span></Col>
        </Row>
      </Card.Body>
    </Card>
    <Row>
      {artifactsToShow.map((art, i) =>
        <Col key={i} lg={4} md={6} className="mb-2">
          <ArtifactCard
            artifactId={art.id}
            onDelete={() => deleteArtifact(art.id)}
            onEdit={() => editArtifact(art.id)}
          />
        </Col>
      )}
    </Row>
    {numPages > 1 && <Card bg="darkcontent" text="lightfont" className="mb-2">
      <Card.Body>
        <Row>
          <Col>
            <ButtonGroup size="sm">
              {[...Array(numPages).keys()].map(i => <Button key={i} className="px-3" variant={currentPageIndex === i ? "success" : "primary"} onClick={() => {
                setpageIdex(i)
                invScrollRef.current?.scrollIntoView({ behavior: "smooth" })
              }} >
                {i === 0 ? "Page " : ""}{i + 1}
              </Button>)}
            </ButtonGroup>
          </Col>
          <Col xs="auto"><span className="float-right text-right">Showing <b>{artifactsToShow.length}</b> out of {artifacts.length !== totalArtNum ? `${artifacts.length}/` : ""}{totalArtNum} Artifacts</span></Col>
        </Row>
      </Card.Body>
    </Card>}
  </Container >
}