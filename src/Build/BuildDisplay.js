import { faSortAmountDownAlt, faSortAmountUp, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Alert, Badge, Button, ButtonGroup, Card, Col, Container, Dropdown, DropdownButton, ListGroup, Modal, OverlayTrigger, Popover, Row } from 'react-bootstrap';
// eslint-disable-next-line
import Worker from "worker-loader!./BuildWorker.js";
import Artifact from '../Artifact/Artifact';
import ArtifactCard from '../Artifact/ArtifactCard';
import { ArtifactMainStatsData, ArtifactSetsData, ArtifactSlotsData, ArtifactStatsData, ElementalData } from '../Artifact/ArtifactData';
import ArtifactDatabase from '../Artifact/ArtifactDatabase';
import CharacterDatabase from '../Character/CharacterDatabase';
import SlotIcon from '../Components/SlotIcon';
import { deepClone, loadFromLocalStorage, saveToLocalStorage } from '../Util';
import Build from './Build';
import artifactDisplaySortKey from './BuildStatData';

export default class BuildDisplay extends React.Component {
  constructor(props) {
    super(props)
    CharacterDatabase.populateDatebaseFromLocalStorage();
    ArtifactDatabase.populateDatebaseFromLocalStorage();
    this.state = BuildDisplay.getInitialState();
    if (props.location.selectedCharacterKey) {
      this.state = BuildDisplay.getInitialState();
      props.location.selectedCharacterKey && (this.state.selectedCharacterKey = props.location.selectedCharacterKey)
    } else {
      let savedState = loadFromLocalStorage("BuildsDisplay.state")
      if (savedState) {
        let character = CharacterDatabase.getCharacter(savedState.selectedCharacterKey)
        if (savedState && character) this.state = savedState
      }
    }
  }
  static initialState = {
    builds: [],
    generatingBuilds: false,
    selectedCharacterKey: "",
    sandsMainKey: "",
    gobletMainKey: "",
    circletMainkey: "",
    setFilters: [{ key: "", num: 0 }, { key: "", num: 0 }, { key: "", num: 0 }],
    mainStat: ["", "", ""],
    buildFilterKey: "atk",
    asending: false,
    modalBuild: null,
    maxBuildsToShow: 100,
    maxBuildsToGenerate: 500000
  }
  static maxBuildsToShowList = [100, 50, 25, 5]
  static maxBuildsToGenerateList = [50000, 10000, 5000, 1000, 500, 100]
  static getInitialState = () => JSON.parse(JSON.stringify(BuildDisplay.initialState))
  static artifactsSlotsToSelectMainStats = ["sands", "goblet", "circlet"]
  forceUpdateBuildDisplay = () => this.forceUpdate()
  splitArtifacts = () => {
    if (!this.state.selectedCharacterKey) return {};
    let artifactDatabase = ArtifactDatabase.getArtifactDatabase();
    //do not use artifacts that are locked.
    Object.entries(artifactDatabase).forEach(([key, val]) => {
      if (val.lock) delete artifactDatabase[key]
      if (this.state.selectedCharacterKey && val.location && val.location !== this.state.selectedCharacterKey)
        delete artifactDatabase[key]
    })
    if (this.state.setFilters.every(filter => filter.key)) {
      let filterKeys = this.state.setFilters.map(filter => filter.key)
      //filter database to only filtered artifacts, if all 3 sets are specified
      Object.entries(artifactDatabase).forEach(([key, val]) => {
        if (filterKeys.includes(val.setKey))
          delete artifactDatabase[key]
      })
    }
    let split = Build.splitArtifactsBySlot(artifactDatabase);
    //filter the split slots on the mainstats selected.
    BuildDisplay.artifactsSlotsToSelectMainStats.forEach((slotKey, index) =>
      this.state.mainStat[index] && (split[slotKey] = split[slotKey].filter((art) => art.mainStatKey === this.state.mainStat[index])))
    return split
  }
  changeMainStat = (index, mainStatKey) => {
    this.setState(state => {
      let mainStat = deepClone(state.mainStat);
      mainStat[index] = mainStatKey;
      return { mainStat }
    })
  }
  changeSetFilterKey = (index, newkey, setsNumArr) => {
    if (this.state.setFilters[index].key === newkey) return
    this.setState((state) => {
      let setFilters = deepClone(state.setFilters);
      let num = 0
      if (setsNumArr && setsNumArr[0])
        num = parseInt(setsNumArr[0])
      setFilters[index] = { key: newkey, num }
      return { setFilters }
    })
  }
  dropdownitemsForStar = (star, index) =>
    Artifact.getArtifactSetsByMaxStarEntries(star).map(([key, setobj]) => {
      if (this.state.setFilters.some(filter => filter.key === key)) return false;
      let setsNumArr = Object.keys(ArtifactSetsData[key].sets)
      let artsAccountedOther = this.state.setFilters.reduce((accu, cur, ind) => (cur.key && ind !== index) ? accu + cur.num : accu, 0)
      if (setsNumArr.every(num => parseInt(num) + artsAccountedOther > 5)) return false;
      return (<Dropdown.Item key={key}
        onClick={() => this.changeSetFilterKey(index, key, setsNumArr)}
      >
        {setobj.name}
      </Dropdown.Item>)
    })

  generateBuilds = (split, artifactSetPerms) => {
    this.setState({ generatingBuilds: true, builds: [] })
    let character = CharacterDatabase.getCharacter(this.state.selectedCharacterKey)
    let data = {
      split, artifactSetPerms, setFilters: this.state.setFilters, character, ArtifactStatsData,
      ArtifactSlotsData, ArtifactMainStatsData, ArtifactSetsData, maxBuildsToShow: this.state.maxBuildsToShow,
      buildFilterKey: this.state.buildFilterKey, asending: this.state.asending
    }

    // let worker = new Worker('BuildWorker.js');
    let worker = new Worker();
    worker.onmessage = (e) =>
      this.setState({ builds: e.data, generatingBuilds: false })
    worker.postMessage(data)
  }

  BuildGeneratorEditorCard = (props) => {
    let charlist = CharacterDatabase.getCharacterDatabase();
    let selectedCharacter = CharacterDatabase.getCharacter(this.state.selectedCharacterKey)
    let characterName = selectedCharacter ? selectedCharacter.name : "Character Name"
    let artsAccounted = this.state.setFilters.reduce((accu, cur) => cur.key ? accu + cur.num : accu, 0)
    let split = this.splitArtifacts();
    let artifactSetPerms = Build.generateAllPossibleArtifactSetPerm(this.state.setFilters)
    let totBuildNumber = Build.calculateTotalBuildNumber(split, artifactSetPerms, this.state.setFilters)
    let buildAlert = totBuildNumber === 0 ?
      <Alert variant="warning" className="mb-0"><span>Current configuration will not generate any builds for <b>{characterName}</b>. Please change your Artifact configurations, or add/unlock more Artifacts.</span></Alert>
      : (totBuildNumber > this.state.maxBuildsToGenerate ?
        <Alert variant="danger" className="mb-0"><span>Current configuration will generate <b>{totBuildNumber}</b> builds for <b>{characterName}</b>. Please restrict artifact configuration to reduce builds to less than {this.state.maxBuildsToGenerate}, or your browser might crash.</span></Alert> :
        <Alert variant="success" className="mb-0"><span>Current configuration will generate <b>{totBuildNumber}</b> builds for <b>{characterName}</b>.</span></Alert>)
    let sortName = artifactDisplaySortKey[this.state.buildFilterKey] ? artifactDisplaySortKey[this.state.buildFilterKey].name : ""
    if (this.state.buildFilterKey === "ele_atk" && selectedCharacter)
      sortName = `${ElementalData[selectedCharacter.element].name} ${artifactDisplaySortKey.ele_atk.name}`
    if (!sortName && selectedCharacter && this.state.buildFilterKey.includes("ele_dmg"))
      sortName = `${ElementalData[selectedCharacter.element].name} ${artifactDisplaySortKey.ele_dmg.name}`

    return <Card bg="darkcontent" text="lightfont">
      <Card.Header>Build Generator</Card.Header>
      <Card.Body>
        <Row>
          <Col>
            {/* Character picker */}
            <div className="mb-2">
              <DropdownButton title={this.state.selectedCharacterKey ? characterName : "Select Character"}>
                <Dropdown.Item onClick={() => this.setState({ selectedCharacterKey: "" })}>
                  No Character
              </Dropdown.Item>
                {Object.values(charlist).map((char, i) =>
                  <Dropdown.Item key={char.name + i}
                    onClick={() => this.setState({ selectedCharacterKey: char.id })}
                  >
                    {char.name}
                  </Dropdown.Item>)}
              </DropdownButton>
            </div>
            {/* Artifact set picker */}
            {this.state.setFilters.map((setFilter, index) =>
              <div className="mb-2" key={index}>
                <ButtonGroup>
                  {/* Artifact set */}
                  <DropdownButton as={ButtonGroup} title={setFilter.key ? ArtifactSetsData[setFilter.key].name : "Set (Optional)"} >
                    <Dropdown.Item onClick={() => this.changeSetFilterKey(index, "")}>
                      Unselect Artifact
                  </Dropdown.Item>
                    <Dropdown.ItemText>Max Rarity 🟊🟊🟊🟊🟊</Dropdown.ItemText>
                    {this.dropdownitemsForStar(5, index)}
                    <Dropdown.Divider />
                    <Dropdown.ItemText>Max Rarity 🟊🟊🟊🟊</Dropdown.ItemText>
                    {this.dropdownitemsForStar(4, index)}
                    <Dropdown.Divider />
                    <Dropdown.ItemText>Max Rarity 🟊🟊🟊</Dropdown.ItemText>
                    {this.dropdownitemsForStar(3, index)}
                  </DropdownButton>
                  {/* set number */}
                  <DropdownButton as={ButtonGroup} title={`${setFilter.num}-set`}
                    disabled={!setFilter.key || artsAccounted >= 5}
                  >
                    {setFilter.key && Object.keys(ArtifactSetsData[setFilter.key].sets).map(num => {
                      let artsAccountedOther = this.state.setFilters.reduce((accu, cur) => (cur.key && cur.key !== setFilter.key) ? accu + cur.num : accu, 0)
                      return (parseInt(num) + artsAccountedOther <= 5) &&
                        (<Dropdown.Item key={num}
                          onClick={() => this.setState((state) => {
                            let setFilters = deepClone(state.setFilters);
                            setFilters[index].num = parseInt(num)
                            return { setFilters }
                          })}
                        >
                          {`${num}-set`}
                        </Dropdown.Item>)
                    })}
                  </DropdownButton>
                </ButtonGroup>
              </div>
            )}
          </Col>
          <Col>
            <h5>Artifact Main Stat (Optional)</h5>
            {BuildDisplay.artifactsSlotsToSelectMainStats.map((slotKey, index) =>
              (<div className="text-inline mb-1 d-flex justify-content-between" key={slotKey}>
                <h6 className="d-inline mr-2">
                  {SlotIcon[slotKey] && <FontAwesomeIcon icon={SlotIcon[slotKey]} className="mr-2 fa-fw" />}
                  {ArtifactSlotsData[slotKey].name}
                </h6>
                <DropdownButton
                  title={this.state.mainStat[index] ? Artifact.getStatNameWithPercent(this.state.mainStat[index]) : "Select a mainstat"}
                  className="d-inline">
                  <Dropdown.Item onClick={() => this.changeMainStat(index, "")} >No MainStat</Dropdown.Item>
                  {ArtifactSlotsData[slotKey].stats.map(mainStatKey =>
                    <Dropdown.Item onClick={() => this.changeMainStat(index, mainStatKey)} key={mainStatKey}>
                      {Artifact.getStatNameWithPercent(mainStatKey)}
                    </Dropdown.Item>
                  )}
                </DropdownButton>
              </div>))}
          </Col>
        </Row>
        <Row className="d-flex justify-content-between mb-2">
          <Col xs="auto" >
            <Button
              className="h-100"
              disabled={!this.state.selectedCharacterKey || totBuildNumber > this.state.maxBuildsToGenerate || this.state.generatingBuilds}
              variant={(this.state.selectedCharacterKey && totBuildNumber <= this.state.maxBuildsToGenerate) ? "success" : "danger"}
              onClick={() => setTimeout(() => {
                this.generateBuilds(split, artifactSetPerms)
              }, 0)}
            ><span>Generate Builds</span></Button>
          </Col>
          <Col xs="auto">
            {/* Dropdown to select sorting value */}
            <ButtonGroup>
              <DropdownButton disabled={!this.state.selectedCharacterKey} title={`Sort by ${sortName}`} as={ButtonGroup}>
                {this.state.selectedCharacterKey && Object.entries(artifactDisplaySortKey).map(([key, val]) => {
                  let name = val.name
                  let character = CharacterDatabase.getCharacter(this.state.selectedCharacterKey)
                  if (key === "ele_dmg" || key === "ele_atk") {
                    let eleName = ElementalData[character.element].name
                    name = eleName + name
                    key === "ele_dmg" && (key = `${character.element}_${key}`)
                  }
                  return <Dropdown.Item key={key} onClick={() => this.setState({ buildFilterKey: key })}>
                    {name}
                  </Dropdown.Item>
                })}
              </DropdownButton>
              <Button onClick={() => this.setState(state => ({ asending: !state.asending }))}>
                <FontAwesomeIcon icon={this.state.asending ? faSortAmountDownAlt : faSortAmountUp} className="fa-fw" />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
        <Row>
          <Col>{this.state.selectedCharacterKey && buildAlert}</Col>
        </Row>
      </Card.Body>
    </Card>
  }
  ArtifactDisplayItem = (props) => {
    let build = props.build
    let character = props.character
    return (<div>
      {/* <this.BuildModal build={build} />  */}
      <ListGroup.Item
        variant={props.index % 2 ? "customdark" : "customdarker"} className="text-white" action
        onClick={() => this.setState({ modalBuild: build })}
      >
        <Row>
          <Col>{this.ArtifactDisplay(build.setToSlots)}</Col>
        </Row>
        <Row>
          {Object.entries(artifactDisplaySortKey).map(([key, val]) => {
            let name = val.name
            let unit = val.unit ? val.unit : ""
            if (key === "ele_dmg" || key === "ele_atk") {
              let eleName = ElementalData[character.element].name
              name = eleName + name
              key === "ele_dmg" && (key = `${character.element}_${key}`)
            }
            return <Col className="text-nowrap" key={key} xs={12} sm={6} md={4} lg={3}>
              <span>{name}: <span className="text-warning">{build.finalStats[key]}{unit}</span></span>
            </Col>
          })}
        </Row>
      </ListGroup.Item>
    </div>)
  }
  BuildModal = (props) => {
    let build = props.build
    let character = props.character
    return build ? (<Modal show={this.state.modalBuild !== null} onHide={() => this.setState({ modalBuild: null })} size="xl" dialogAs={Container} className="pt-3 pb-3">
      <Card bg="darkcontent" text="lightfont" >
        <Card.Header>
          <Card.Title>
            <Row>
              <Col><span>{character.name} Build</span></Col>
              <Col xs="auto">
                <Button variant="danger" onClick={() => this.setState({ modalBuild: null })}>
                  <FontAwesomeIcon icon={faTimes} /></Button>
              </Col>
            </Row>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col className="mb-3">
              <BuildModalCharacterCard build={build} character={character} />
            </Col>
          </Row>
          <Row>
            <Col>
              <Row>
                <Col sm={6} className="mb-3">
                  <Row className="h-100">
                    <Col xs={12} className="d-flex flex-column">
                      <Card className="flex-grow-1 mb-2" border="light" bg="darkcontent" text="lightfont">
                        <Card.Header>Weapon</Card.Header>
                        <Card.Body>
                          <Row>
                            <Col>
                              <h6>Base ATK {character.weapon_atk}</h6>
                            </Col>
                            <Col>
                              {character.weaponStatKey && <h6>{Artifact.getStatName(character.weaponStatKey)} {character.weaponStatVal}{Artifact.getStatUnit(character.weaponStatKey)}</h6>}
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                      <Card className="flex-grow-1" border="light" bg="darkcontent" text="lightfont">
                        <Card.Header>Artifact Set Effects</Card.Header>
                        <Card.Body>
                          <Row>
                            {Object.entries(build.artifactSetEffect).map(([setKey, effects]) =>
                              <Col key={setKey} xs={12} className="mb-3">
                                <h6>{Artifact.getArtifactSetName(setKey)}</h6>
                                <Row>
                                  {Object.entries(effects).map(([num, effect]) => {
                                    return <Col key="num" xs={12}><Badge variant="success">{num}-Set</Badge> <span>{effect.text}</span></Col>
                                  })}
                                </Row>
                              </Col>
                            )}
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col >
                  </Row>
                </Col>
                {Object.values(build.artifactIds).map(artid =>
                  <Col sm={6} key={artid} className="mb-3">
                    <ArtifactCard artifactData={ArtifactDatabase.getArtifact(artid)} forceUpdate={this.forceUpdateBuildDisplay} />
                  </Col>)}
              </Row>
            </Col>
          </Row>
        </Card.Body>
        <Card.Footer>
          <Row className="d-flex justify-content-between">
            <Col xs="auto">
              <Button variant="primary" onClick={() => this.equipArtifacts(build, character)}>
                <span>Equip Artifacts on Character</span>
              </Button>
            </Col>
            <Col xs="auto">
              <Button variant="danger" onClick={() => this.setState({ modalBuild: null })}>
                <span>Close</span>
              </Button>
            </Col>
          </Row>
        </Card.Footer>
      </Card>
    </Modal>) : null
  }
  ArtifactDisplay = (setToSlots) =>
    Object.entries(setToSlots).sort(([key1, slotarr1], [key2, slotarr2]) => slotarr2.length - slotarr1.length).map(([key, slotarr]) =>
      <Badge key={key} variant="primary" className="mr-2">
        {slotarr.map(slotKey =>
          SlotIcon[slotKey] && <FontAwesomeIcon icon={SlotIcon[slotKey]} key={slotKey} className="fa-fw" />)}
        {ArtifactSetsData[key].name}
      </Badge>
    )

  equipArtifacts = (build, character) => {
    let artifactIds = build.artifactIds;
    //move all the equipped artifacts to the inventory.
    if (character.equippedArtifacts)
      Object.values(character.equippedArtifacts).forEach(artid =>
        ArtifactDatabase.moveToNewLocation(artid, ""))

    CharacterDatabase.equipArtifactBuild(character.id, artifactIds);

    //move all the current build artifacts to the character.
    Object.values(artifactIds).forEach(artid =>
      ArtifactDatabase.moveToNewLocation(artid, character.id))

    this.forceUpdate();
  }
  componentDidUpdate() {
    let state = deepClone(this.state)
    state.builds = [];
    delete state.generatingBuilds
    delete state.modalBuild
    saveToLocalStorage("BuildsDisplay.state", state)
  }
  render() {
    let selectedCharacter = CharacterDatabase.getCharacter(this.state.selectedCharacterKey)
    let characterName = selectedCharacter ? selectedCharacter.name : "Character Name"
    return (<Container>
      <this.BuildModal build={this.state.modalBuild} character={selectedCharacter} />
      <Row className="mt-2 mb-2">
        <Col>
          {/* Build Generator Editor */}
          <this.BuildGeneratorEditorCard />
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <Card bg="darkcontent" text="lightfont">
            <Card.Header>{this.state.selectedCharacterKey ? `Showing first ${this.state.builds.length} Builds generated for ${characterName}` : "Select a character to generate builds."}</Card.Header>
            {/* Build List */}
            <ListGroup>
              {this.state.builds.map((build, index) =>
                (index < this.state.maxBuildsToShow) && <this.ArtifactDisplayItem build={build} character={selectedCharacter} index={index} key={Object.values(build.artifactIds).join("_")} />
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>)
  }
}

const BuildModalCharacterCard = (props) => {
  let build = props.build;
  let character = props.character;
  return (<Card className="h-100" border="success" bg="darkcontent" text="lightfont">
    <Card.Header>Character Stats</Card.Header>
    <Card.Body>
      <Row>
        {Object.entries(artifactDisplaySortKey).map(([key, val]) => {
          let name = val.name
          let unit = val.unit ? val.unit : ""
          if (key === "ele_dmg" || key === "ele_atk") {
            let eleName = ElementalData[character.element].name
            name = eleName + name
            key === "ele_dmg" && (key = `${character.element}_${key}`)
          }
          let statsDisplay = (key in character) ?
            <span>{name}: <span className="text-warning">{character[key]}{unit}</span> <span className="text-success">+ {(build.finalStats[key] - character[key]).toFixed(unit === "%" ? 1 : 0)}{unit}</span></span> :
            <span>{name}: <span className="text-warning">{build.finalStats[key]}{unit}</span></span>
          return <Col className="text-nowrap" key={key} xs={12} sm={6} lg={4}>
            <OverlayTrigger
              placement="top"
              overlay={
                <Popover>
                  <Popover.Title as="h3">
                    {(key in character) ?
                      <span>{name}: {character[key]}{unit} <span className="text-success">+ {(build.finalStats[key] - character[key]).toFixed(1)}{unit}</span></span> :
                      <span>{name}: {build.finalStats[key]}{unit}</span>
                    }
                  </Popover.Title>
                  <Popover.Content>
                    {key.includes("ele_dmg") ? artifactDisplaySortKey["ele_dmg"].explaination : artifactDisplaySortKey[key].explaination}
                  </Popover.Content>
                </Popover>
              }
            >
              {statsDisplay}
            </OverlayTrigger>
          </Col>
        })}
      </Row>
    </Card.Body>
  </Card>)
}