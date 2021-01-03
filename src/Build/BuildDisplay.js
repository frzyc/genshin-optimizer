import { faSortAmountDownAlt, faSortAmountUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Alert, Badge, Button, ButtonGroup, Card, Col, Container, Dropdown, DropdownButton, ListGroup, Modal, Row } from 'react-bootstrap';
import ReactGA from 'react-ga';
// eslint-disable-next-line
import Worker from "worker-loader!./BuildWorker.js";
import Artifact from '../Artifact/Artifact';
import ArtifactDatabase from '../Artifact/ArtifactDatabase';
import Character from '../Character/Character';
import CharacterCard from '../Character/CharacterCard';
import CharacterDatabase from '../Character/CharacterDatabase';
import CharacterDisplayCard from '../Character/CharacterDisplayCard';
import ConditionalSelector from '../Components/ConditionalSelector';
import { ArtifactSlotsData } from '../Data/ArtifactData';
import { DatabaseInitAndVerify } from '../DatabaseUtil';
import Stat from '../Stat';
import { DependencyStatKeys } from '../StatDependency';
import ConditionalsUtil from '../Util/ConditionalsUtil';
import { deepClone, loadFromLocalStorage, saveToLocalStorage } from '../Util/Util';
import Build from './Build';

export default class BuildDisplay extends React.Component {
  constructor(props) {
    super(props)
    DatabaseInitAndVerify();
    this.state = BuildDisplay.getInitialState();
    if (props.location.selectedCharacterId) {
      this.state = BuildDisplay.getInitialState();
      props.location.selectedCharacterId && (this.state.selectedCharacterId = props.location.selectedCharacterId)
    } else {
      let savedState = loadFromLocalStorage("BuildsDisplay.state")
      if (savedState) {
        let character = CharacterDatabase.getCharacter(savedState.selectedCharacterId)
        if (savedState && character) this.state = savedState
      }
    }
    ReactGA.pageview('/build')
  }
  static initialState = {
    builds: [],
    generatingBuilds: false,
    selectedCharacterId: "",
    setFilters: [{ key: "", num: 0 }, { key: "", num: 0 }, { key: "", num: 0 }],
    artifactConditionals: [],//{ setKey: "", setNumKey: "", conditionalNum: 0 }
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

  statsDisplayKeys = () => ["hp", "atk", "def", "ele_mas", "crit_rate", "crit_dmg", "heal_bonu", "ener_rech", "phy_dmg", "ele_dmg", "phy_avg_dmg", "ele_avg_dmg", "norm_atk_avg_dmg", "char_atk_avg_dmg", "skill_avg_dmg", "burst_avg_dmg"]

  splitArtifacts = () => {
    if (!this.state.selectedCharacterId) return {};
    let artifactDatabase = ArtifactDatabase.getArtifactDatabase();
    //do not use artifacts that are locked.
    Object.entries(artifactDatabase).forEach(([key, val]) => {
      if (val.lock) delete artifactDatabase[key]
      if (this.state.selectedCharacterId && val.location && val.location !== this.state.selectedCharacterId)
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
  changeSetFilterKey = (index, newkey, setsNumArr) => this.setState(state => {
    let oldKey = state.setFilters[index].key
    if (oldKey === newkey) return
    //remove conditionals with that key
    let artifactConditionals = state.artifactConditionals?.filter?.(artifactCond => artifactCond.srcKey !== oldKey) || []
    let setFilters = state.setFilters;
    let num = 0
    //automatically select the 1st element from setsNumArr
    if (setsNumArr && setsNumArr[0])
      num = parseInt(setsNumArr[0])
    setFilters[index] = { key: newkey, num }
    return { setFilters, artifactConditionals }
  })

  dropdownitemsForStar = (star, index) =>
    Artifact.getArtifactSetsByMaxStarEntries(star).map(([setKey, setobj]) => {
      if (this.state.setFilters.some(filter => filter.key === setKey)) return false;
      let setsNumArr = Object.keys(Artifact.getArtifactSets(setKey))
      let artsAccountedOther = this.state.setFilters.reduce((accu, cur, ind) => (cur.key && ind !== index) ? accu + cur.num : accu, 0)
      if (setsNumArr.every(num => parseInt(num) + artsAccountedOther > 5)) return false;
      return (<Dropdown.Item key={setKey}
        onClick={() => this.changeSetFilterKey(index, setKey, setsNumArr)}
      >
        {setobj.name}
      </Dropdown.Item>)
    })

  generateBuilds = (split, artifactSetPerms) => {
    this.setState({ generatingBuilds: true, builds: [] })
    let { setFilters, asending, buildFilterKey, maxBuildsToShow, artifactConditionals } = this.state
    let character = CharacterDatabase.getCharacter(this.state.selectedCharacterId)
    let initialStats = Character.calculateCharacterWithWeaponStats(character)

    let artifactSetEffects = Artifact.getAllArtifactSetEffectsObj(artifactConditionals)
    let splitArtifacts = deepClone(split)
    //add mainStatVal to each artifact, TODO add main stat assuming fully leveled up
    Object.values(splitArtifacts).forEach(artArr => {
      artArr.forEach(art => {
        art.mainStatVal = Artifact.getMainStatValue(art.mainStatKey, art.numStars, art.level);
      })
    })
    //generate the key dependencies for the formula
    let depdendencyStatKeys = DependencyStatKeys(buildFilterKey, initialStats.formulaOverrides)

    //create an obj with app the artifact set effects to pass to buildworker.
    let data = {
      splitArtifacts, artifactSetPerms, initialStats, artifactSetEffects, depdendencyStatKeys,
      setFilters, maxBuildsToShow, buildFilterKey, asending,
    }
    if (this.worker) this.worker.terminate()
    this.worker = new Worker();
    this.worker.onmessage = (e) => {
      ReactGA.timing({
        category: "Build Generation",
        variable: "timing",
        value: e.data.timing,
        label: Build.calculateTotalBuildNumber(split, artifactSetPerms, this.state.setFilters)
      })
      let builds = e.data.builds.map(obj =>
        Character.calculateBuildWithObjs(artifactConditionals, initialStats, obj.artifacts))
      this.setState({ builds, generatingBuilds: false })
      // worker.terminate()
      this.worker.terminate()
      delete this.worker
    }

    this.worker.postMessage(data)
  }

  BuildGeneratorEditorCard = (props) => {
    let charlist = CharacterDatabase.getCharacterDatabase();
    let selectedCharacter = CharacterDatabase.getCharacter(this.state.selectedCharacterId)
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
    let characterDropDown = <DropdownButton title={this.state.selectedCharacterId ? characterName : "Select Character"}>
      <Dropdown.Item onClick={() => this.setState({ selectedCharacterId: "", builds: [], buildFilterKey: "atk" })}>No Character</Dropdown.Item>
      {Object.values(charlist).map((char, i) =>
        <Dropdown.Item key={char.name + i}
          onClick={() => this.setState({ selectedCharacterId: char.id, builds: [], buildFilterKey: "atk" })}
        >
          {char.name}
        </Dropdown.Item>)}
    </DropdownButton>
    return <Card bg="darkcontent" text="lightfont">
      <Card.Header>Build Generator</Card.Header>
      <Card.Body>
        <Row >
          <Col xs={12} lg={6} className="mb-2">
            {/* character selection */}
            {this.state.selectedCharacterId ? <CharacterCard header={characterDropDown} characterId={this.state.selectedCharacterId} bg={"lightcontent"} footer={false} cardClassName="mb-2" /> :
              <Card bg="lightcontent" text="lightfont" className="mb-2">
                <Card.Header>
                  {characterDropDown}
                </Card.Header>
              </Card>}
            {/* main stat selector */}
            <Card bg="lightcontent" text="lightfont">
              <Card.Header>Artifact Main Stat (Optional)</Card.Header>
              <Card.Body>
                {BuildDisplay.artifactsSlotsToSelectMainStats.map((slotKey, index) =>
                (<div className="text-inline mb-1 d-flex justify-content-between" key={slotKey}>
                  <h6 className="d-inline mr-2">
                    {Artifact.getArtifactSlotNameWithIcon(slotKey)}
                  </h6>
                  <DropdownButton
                    title={this.state.mainStat[index] ? Stat.getStatNameWithPercent(this.state.mainStat[index]) : "Select a mainstat"}
                    className="d-inline">
                    <Dropdown.Item onClick={() => this.changeMainStat(index, "")} >No MainStat</Dropdown.Item>
                    {ArtifactSlotsData[slotKey].stats.map(mainStatKey =>
                      <Dropdown.Item onClick={() => this.changeMainStat(index, mainStatKey)} key={mainStatKey}>
                        {Stat.getStatNameWithPercent(mainStatKey)}
                      </Dropdown.Item>
                    )}
                  </DropdownButton>
                </div>))}
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} lg={6} className="mb-2"><Row>
            {/* Artifact set picker */}
            {this.state.setFilters.map((setFilter, index) => {
              let { key: setKey, num } = setFilter
              let { artifactConditionals } = this.state
              return (<Col className="mb-2" key={index} xs={12}>
                <Card className="h-100" bg="lightcontent" text="lightfont">
                  <Card.Header>
                    <ButtonGroup>
                      {/* Artifact set */}
                      <DropdownButton as={ButtonGroup} title={Artifact.getArtifactSetName(setFilter.key, "Set (Optional)")} >
                        <Dropdown.Item onClick={() => this.changeSetFilterKey(index, "")}>Unselect Artifact</Dropdown.Item>
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
                        {setFilter.key && Artifact.getArtifactSetEffectsObj(setFilter.key) && Object.keys(Artifact.getArtifactSetEffectsObj(setFilter.key)).map(num => {
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
                  </Card.Header>
                  {setKey ? <Card.Body><Row>
                    {Object.keys(Artifact.getArtifactSets(setKey, {})).filter(setNkey => parseInt(setNkey) <= num).map(setNumKey => {
                      let setStats = Artifact.getArtifactSetNumStats(setKey, setNumKey)
                      let conditionalNum = 0;
                      let conditional = Artifact.getArtifactSetEffectConditional(setKey, setNumKey)
                      if (conditional) {
                        conditionalNum = ConditionalsUtil.getConditionalNum(artifactConditionals, { srcKey: setKey, srcKey2: setNumKey })
                        let conditionalStats = Artifact.getArtifactConditionalStats(setKey, setNumKey, conditionalNum)
                        if (conditionalStats) {
                          if (!setStats) setStats = {}
                          Object.entries(conditionalStats).forEach(([statKey, val]) =>
                            setStats[statKey] = (setStats[statKey] || 0) + val)
                        }
                      }
                      let setStateArtifactConditional = (conditionalNum) => this.setState(state =>
                        ({ artifactConditionals: ConditionalsUtil.setConditional(state.artifactConditionals, { srcKey: setKey, srcKey2: setNumKey }, conditionalNum) }))
                      let conditionalElement = <ConditionalSelector
                        conditional={conditional}
                        conditionalNum={conditionalNum}
                        setConditional={setStateArtifactConditional}
                        defEle={<Badge variant="success">{setNumKey}-Set</Badge>}
                      />
                      return <Col key={setNumKey} xs={12} className="mb-2">
                        <h6>{conditionalElement} {Artifact.getArtifactSetEffectText(setKey, setNumKey)}</h6>
                        {setStats ? <Row>
                          {Object.entries(setStats).map(([statKey, val]) =>
                            <Col xs={12} key={statKey}>{Stat.getStatName(statKey)}: {val}{Stat.getStatUnit(statKey)}</Col>)}
                        </Row> : null}
                      </Col>
                    })}
                  </Row></Card.Body> : null}
                </Card>
              </Col>)
            })}
          </Row></Col>
        </Row>
        <Row className="mb-2">
          <Col>{this.state.selectedCharacterId && buildAlert}</Col>
        </Row>
        <Row className="d-flex justify-content-between">
          <Col xs="auto" >
            <Button
              className="h-100"
              disabled={!this.state.selectedCharacterId || totBuildNumber > this.state.maxBuildsToGenerate || this.state.generatingBuilds}
              variant={(this.state.selectedCharacterId && totBuildNumber <= this.state.maxBuildsToGenerate) ? "success" : "danger"}
              onClick={() => setTimeout(() => {
                this.generateBuilds(split, artifactSetPerms)
              }, 0)}
            ><span>Generate Builds</span></Button>
          </Col>
          <Col xs="auto">
            {/* Dropdown to select sorting value */}
            <ButtonGroup>
              <DropdownButton disabled={!this.state.selectedCharacterId} title={`Sort by ${Stat.getStatNameWithPercent(this.state.buildFilterKey)}`} as={ButtonGroup}>
                {this.state.selectedCharacterId && this.statsDisplayKeys().map(key => {
                  if (key === "ele_dmg" || key === "ele_avg_dmg")//add character specific ele_dmg and ele_avg_dmg
                    key = `${Character.getElementalKey(selectedCharacter.characterKey)}_${key}`
                  return <Dropdown.Item key={key} onClick={() => this.setState({ buildFilterKey: key })}>
                    {Stat.getStatNameWithPercent(key)}
                  </Dropdown.Item>
                })}
              </DropdownButton>
              <Button onClick={() => this.setState(state => ({ asending: !state.asending }))}>
                <FontAwesomeIcon icon={this.state.asending ? faSortAmountDownAlt : faSortAmountUp} className="fa-fw" />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  }
  ArtifactDisplayItem = (props) => {
    let { build, character } = props
    return (<div>
      <ListGroup.Item
        variant={props.index % 2 ? "customdark" : "customdarker"} className="text-white" action
        onClick={() => this.setState({ modalBuild: build })}
      >
        <Row>
          <Col>{Object.entries(build.setToSlots).sort(([key1, slotarr1], [key2, slotarr2]) => slotarr2.length - slotarr1.length).map(([key, slotarr]) =>
            <Badge key={key} variant="primary" className="mr-2">
              {slotarr.map(slotKey => Artifact.getArtifactSlotIcon(slotKey))} {Artifact.getArtifactSetName(key)}
            </Badge>
          )}</Col>
        </Row>
        <Row>
          {this.statsDisplayKeys().map(key => {
            if (key === "ele_dmg" || key === "ele_avg_dmg")//add character specific ele_dmg and ele_avg_dmg
              key = `${Character.getElementalKey(character.characterKey)}_${key}`
            let unit = Stat.getStatUnit(key)
            return <Col className="text-nowrap" key={key} xs={12} sm={6} md={4} lg={3}>
              <span>{Stat.getStatName(key)}: <span className="text-warning">{build.finalStats[key]?.toFixed(Stat.fixedUnit(key))}{unit}</span></span>
            </Col>
          })}
        </Row>
      </ListGroup.Item>
    </div>)
  }
  BuildModal = (props) => {
    let { build, character } = props
    return build ? (<Modal show={this.state.modalBuild !== null} onHide={() => this.setState({ modalBuild: null })} size="xl" dialogAs={Container} className="pt-3 pb-3">
      <CharacterDisplayCard characterId={character.id} newBuild={build} onClose={() => this.setState({ modalBuild: null })} forceUpdate={this.forceUpdateBuildDisplay} />
    </Modal>) : null
  }

  componentDidUpdate() {
    let state = deepClone(this.state)
    state.builds = [];
    delete state.generatingBuilds
    delete state.modalBuild
    saveToLocalStorage("BuildsDisplay.state", state)
  }
  componentWillUnmount() {
    this.worker?.terminate()
    delete this.worker
  }
  render() {
    let selectedCharacter = CharacterDatabase.getCharacter(this.state.selectedCharacterId)
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
            <Card.Header>{this.state.selectedCharacterId ? `Showing ${this.state.builds.length} Builds generated for ${characterName}` : "Select a character to generate builds."}</Card.Header>
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