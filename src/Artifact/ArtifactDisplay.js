import { faCheckSquare, faSortAmountDownAlt, faSortAmountUp, faSquare, faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, ButtonGroup, Card, Dropdown, InputGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import ReactGA from 'react-ga';
import Character from '../Character/Character';
import CharacterDatabase from '../Character/CharacterDatabase';
import { CharacterSelectionDropdownList } from '../Components/CharacterSelection';
import CustomFormControl from '../Components/CustomFormControl';
import { Stars } from '../Components/StarDisplay';
import { DatabaseInitAndVerify } from '../DatabaseUtil';
import InfoComponent from '../InfoComponent';
import Stat from '../Stat';
import { deepClone, loadFromLocalStorage, saveToLocalStorage } from '../Util/Util';
import Artifact from './Artifact';
import ArtifactCard from './ArtifactCard';
import ArtifactDatabase from './ArtifactDatabase';
import ArtifactDisplayInfo from './ArtifactDisplayInfo/ArtifactDisplayInfo';
import ArtifactEditor from './ArtifactEditor';

const sortMap = {
  quality: "Quality",
  level: "Level",
  efficiency: "Current Substat Eff.",
  mefficiency: "Maximum Substat Eff."
}
export default class ArtifactDisplay extends React.Component {
  constructor(props) {
    super(props)
    DatabaseInitAndVerify();
    this.state = {
      artToEditId: null,
      ...deepClone(ArtifactDisplay.initialFilter),
      maxNumArtifactsToDisplay: 50
    }

    if (props.location.artToEditId)
      this.state.artToEditId = props.location.artToEditId
    else {
      let savedState = loadFromLocalStorage("ArtifactDisplay.state")
      if (savedState) this.state = { ...this.state, ...savedState }
    }

    ReactGA.pageview('/artifact')
  }
  static initialFilter = {
    filterArtSetKey: "",
    filterStars: [3, 4, 5],
    filterLevelLow: 0,
    filterLevelHigh: 20,
    filterSlotKey: "",
    filterMainStatKey: "",
    filterSubstats: ["", "", "", ""],
    filterLocation: "",
    ascending: false,
  }
  ressetFilters = () => this.setState(state => ({ ...state, ...deepClone(ArtifactDisplay.initialFilter) }))
  forceUpdateArtifactDisplay = () => this.forceUpdate()

  addArtifact = (art) => {
    ArtifactDatabase.updateArtifact(art);
    this.setState({ artToEditId: null })
  }

  deleteArtifact = (id) => {
    let art = ArtifactDatabase.get(id);
    if (art && art.location)
      CharacterDatabase.unequipArtifactOnSlot(art.location, art.slotKey);
    ArtifactDatabase.removeArtifactById(id)
    this.forceUpdate()
  };

  editArtifact = (id) =>
    this.setState({ artToEditId: id }, () =>
      this.scrollRef.current.scrollIntoView({ behavior: "smooth" }))

  cancelEditArtifact = () =>
    this.setState({ artToEditId: null })

  unequipAll = () => {
    if (!window.confirm("Do you want to unequip ALL your equipped artifacts from EVERY character?")) return
    ArtifactDatabase.unequipAllArtifacts()
    CharacterDatabase.unequipAllArtifacts()
    this.forceUpdate()
  }
  componentDidUpdate() {
    let state = deepClone(this.state)
    delete state.artToEditId
    saveToLocalStorage("ArtifactDisplay.state", state)
  }

  componentDidMount() {
    this.scrollRef = React.createRef()
    Promise.all([
      Character.getCharacterDataImport(),
      Artifact.getDataImport(),
    ]).then(() => this.forceUpdate())
  }
  render() {
    let { artToEditId, filterArtSetKey, filterSlotKey, filterMainStatKey, filterStars, filterLevelLow, filterLevelHigh, filterSubstats = this.initialFilter.filterSubstats, maxNumArtifactsToDisplay, filterLocation = "", sortType = Object.keys(sortMap)[0], ascending = false } = this.state
    let artifactDB = ArtifactDatabase.getArtifactDatabase() || {}
    let totalArtNum = Object.keys(artifactDB)?.length || 0
    let locationDisplay
    if (!filterLocation) locationDisplay = <span>Location: Any</span>
    else if (filterLocation === "Inventory") locationDisplay = <span>Location: Inventory</span>
    else if (filterLocation === "Equipped") locationDisplay = <span>Location: Equipped</span>
    else locationDisplay = <b>{Character.getName(filterLocation)}</b>
    let artifacts = Object.values(artifactDB).filter(art => {
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
    return (<Container className="mt-2" ref={this.scrollRef}>
      <InfoComponent
        pageKey="artifactPage"
        modalTitle="Artifact Editing/Management Page Info"
        text={["The maximum efficiency of a 4 star artifact is around 60%.",
          "The maximum efficiency of an artifact will usually decrease as you upgrade. It's perfectly normal!",
          "Substats with \"1\"s are the hardest to scan in screenshots.",
          "If all your rolls(6) went into a single substat, it will be purple!",
          "Click on \"Details\" when you are upgrading your artifacts in game to scan as you upgrade."]}
      >
        <ArtifactDisplayInfo />
      </InfoComponent>
      <Row className="mb-2 no-gutters"><Col>
        <ArtifactEditor
          artifactIdToEdit={artToEditId}
          addArtifact={this.addArtifact}
          cancelEdit={this.cancelEditArtifact}
        />
      </Col></Row>
      <Row className="mb-2"><Col>
        <Card bg="darkcontent" text="lightfont">
          <Card.Header>
            <span>Artifact Filter</span>
            <Button size="sm" className="ml-2" variant="danger" onClick={this.ressetFilters} ><FontAwesomeIcon icon={faUndo} className="fa-fw" /> Reset</Button>
            <Button size="sm" className="ml-2" variant="danger" onClick={this.unequipAll} >Unequip Artifacts on every character</Button>
            <span className="float-right text-right">Showing <b>{artifacts.length > maxNumArtifactsToDisplay ? maxNumArtifactsToDisplay : artifacts.length}</b> out of {artifacts.length !== totalArtNum ? `${artifacts.length}/` : ""}{totalArtNum} Artifacts</span>
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
                    <Dropdown.Item onClick={() => this.setState({ filterArtSetKey: "" })}>Unselect</Dropdown.Item>
                    {[5, 4, 3].map(star =>
                      <React.Fragment key={star}>
                        <Dropdown.Divider />
                        <Dropdown.ItemText>Max Rarity <Stars stars={star} /></Dropdown.ItemText>
                        {Artifact.getSetsByMaxStarEntries(star).map(([key, setobj]) =>
                          <Dropdown.Item key={key} onClick={() => this.setState({ filterArtSetKey: key })}>
                            {setobj.name}
                          </Dropdown.Item >)}
                      </React.Fragment>)}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              {/* Artifact stars filter */}
              <Col xs={12} lg={6} className="mb-2">
                <ToggleButtonGroup className="w-100 d-flex" type="checkbox" as={InputGroup.Append} onChange={(e) => this.setState({ filterStars: e })} defaultValue={filterStars}>
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
                    onValueChange={(val) => val >= 0 && val <= filterLevelHigh && this.setState({ filterLevelLow: val })}
                  />
                  <CustomFormControl
                    value={filterLevelHigh}
                    placeholder={`Max Level`}
                    onValueChange={(val) => val <= 20 && val >= filterLevelLow && this.setState({ filterLevelHigh: val })}
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
                    <Dropdown.Item onClick={() => this.setState({ filterSlotKey: "" })} >
                      Unselect
                        </Dropdown.Item>
                    {Artifact.getSlotKeys().map(key =>
                      <Dropdown.Item key={key} onClick={() => this.setState({ filterSlotKey: key })} >
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
                    <Dropdown.Item onClick={() => this.setState({ filterMainStatKey: "" })}>Unselect</Dropdown.Item>
                    {Artifact.getMainStatKeys().map((statKey) => <Dropdown.Item key={statKey} onClick={() => this.setState({ filterMainStatKey: statKey })} >
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
                        onClick={() =>
                          this.setState(state => {
                            let tempfilterSubstats = state.filterSubstats
                            tempfilterSubstats[index] = ""
                            return { filterSubstats: tempfilterSubstats }
                          })}
                      >No Substat</Dropdown.Item>
                      {Artifact.getSubStatKeys().filter(key => !filterSubstats.includes(key)).map(key =>
                        <Dropdown.Item key={key}
                          onClick={() =>
                            this.setState(state => {
                              let tempfilterSubstats = state.filterSubstats
                              tempfilterSubstats[index] = key
                              return { filterSubstats: tempfilterSubstats }
                            })}
                        >{Stat.getStatNameWithPercent(key)}</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              )}
              {/* location */}
              <Col xs={12} lg={6} className="mb-2">
                <Dropdown className="flex-grow-1">
                  <Dropdown.Toggle className="w-100" variant={filterLocation ? "success" : "primary"}>
                    {locationDisplay}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => this.setState({ filterLocation: "" })}>Unselect</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setState({ filterLocation: "Inventory" })}>Inventory</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setState({ filterLocation: "Equipped" })}>Currently Equipped</Dropdown.Item>
                    <Dropdown.Divider />
                    <CharacterSelectionDropdownList onSelect={cid => this.setState({ filterLocation: cid })} />
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
                        <Dropdown.Item key={key} onClick={() => this.setState({ sortType: key })}>{name}</Dropdown.Item>)}
                    </Dropdown.Menu>
                  </Dropdown>
                  <Button onClick={() => this.setState(state => ({ ascending: !state.ascending }))} className="flex-shrink-1">
                    <FontAwesomeIcon icon={ascending ? faSortAmountDownAlt : faSortAmountUp} className="fa-fw" />
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col></Row>
      <Row className="mb-2">
        {artifacts.map((art, i) =>
          i < maxNumArtifactsToDisplay ? <Col key={art.id} lg={4} md={6} className="mb-2">
            <ArtifactCard
              artifactId={art.id}
              onDelete={() => this.deleteArtifact(art.id)}
              onEdit={() => this.editArtifact(art.id)}
              forceUpdate={this.forceUpdateArtifactDisplay}
            />
          </Col> : null
        )}
      </Row>
    </Container >)
  }
}
