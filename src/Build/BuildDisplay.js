import { faCheckSquare, faSortAmountDownAlt, faSortAmountUp, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { lazy } from 'react';
import { Alert, Badge, Button, ButtonGroup, Card, Col, Container, Dropdown, DropdownButton, ListGroup, Modal, Row } from 'react-bootstrap';
import ReactGA from 'react-ga';
// eslint-disable-next-line
import Worker from "worker-loader!./BuildWorker.js";
import Artifact from '../Artifact/Artifact';
import ArtifactDatabase from '../Artifact/ArtifactDatabase';
import Character from '../Character/Character';
import CharacterCard from '../Character/CharacterCard';
import CharacterDatabase from '../Character/CharacterDatabase';
import ConditionalSelector from '../Components/ConditionalSelector';
import { DatabaseInitAndVerify } from '../DatabaseUtil';
import Stat from '../Stat';
import { DependencyStatKeys } from '../StatDependency';
import ConditionalsUtil from '../Util/ConditionalsUtil';
import { deepClone, loadFromLocalStorage, saveToLocalStorage } from '../Util/Util';
import Weapon from '../Weapon/Weapon';
import Build from './Build';

//lazy load the character display
const CharacterDisplayCardPromise = import('../Character/CharacterDisplayCard');
const CharacterDisplayCard = lazy(() => CharacterDisplayCardPromise)

export default class BuildDisplay extends React.Component {
  constructor(props) {
    super(props)
    DatabaseInitAndVerify();
    this.state = BuildDisplay.getInitialState();
    if (props.location.selectedCharacterId)
      this.state.selectedCharacterId = props.location.selectedCharacterId
    else {
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
    buildFilterKey: "atk_final",
    artifactsAssumeFull: false,
    asending: false,
    modalBuild: null,
    editCharacter: false,
    maxBuildsToShow: 100,
    maxBuildsToGenerate: 500000
  }
  static maxBuildsToShowList = [100, 50, 25, 5]
  static maxBuildsToGenerateList = [500000, 100000, 50000, 10000, 5000, 1000]
  static getInitialState = () => deepClone(BuildDisplay.initialState)
  static artifactsSlotsToSelectMainStats = ["sands", "goblet", "circlet"]
  forceUpdateBuildDisplay = () => this.forceUpdate()

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
    let split = Artifact.splitArtifactsBySlot(artifactDatabase);
    //filter the split slots on the mainstats selected.
    BuildDisplay.artifactsSlotsToSelectMainStats.forEach((slotKey, index) =>
      this.state.mainStat[index] && (split[slotKey] = split[slotKey].filter((art) => art.mainStatKey === this.state.mainStat[index])))
    return split
  }
  changeMainStat = (index, mainStatKey) => {
    this.setState(state => {
      let mainStat = state.mainStat;
      mainStat[index] = mainStatKey;
      return { mainStat }
    }, this.autoGenerateBuilds)
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
  }, this.autoGenerateBuilds)

  dropdownitemsForStar = (star, index) =>
    Artifact.getSetsByMaxStarEntries(star).map(([setKey, setobj]) => {
      if (this.state.setFilters.some(filter => filter.key === setKey)) return false;
      let setsNumArr = Object.keys(Artifact.getSetEffectsObj(setKey))
      let artsAccountedOther = this.state.setFilters.reduce((accu, cur, ind) => (cur.key && ind !== index) ? accu + cur.num : accu, 0)
      if (setsNumArr.every(num => parseInt(num) + artsAccountedOther > 5)) return false;
      return (<Dropdown.Item key={setKey}
        onClick={() => this.changeSetFilterKey(index, setKey, setsNumArr)}
      >
        {setobj.name}
      </Dropdown.Item>)
    })
  autoGenerateBuilds = () => typeof this.totBuildNumber === "number" && this.totBuildNumber <= this.state.maxBuildsToShow && this.generateBuilds()

  generateBuilds = () => {
    let { split, artifactSetPerms, totBuildNumber } = this
    if (!totBuildNumber) return this.setState({ builds: [] })
    this.setState({ generatingBuilds: true })
    let { setFilters, asending, buildFilterKey, maxBuildsToShow, artifactConditionals, artifactsAssumeFull } = this.state
    let character = CharacterDatabase.getCharacter(this.state.selectedCharacterId)
    let initialStats = Character.calculateCharacterWithWeaponStats(character)
    initialStats.artifactsAssumeFull = artifactsAssumeFull

    let artifactSetEffects = Artifact.getAllArtifactSetEffectsObj(artifactConditionals)
    let splitArtifacts = deepClone(split)
    //add mainStatVal to each artifact
    Object.values(splitArtifacts).forEach(artArr => {
      artArr.forEach(art => {
        art.mainStatVal = Artifact.getMainStatValue(art.mainStatKey, art.numStars, artifactsAssumeFull ? art.numStars * 4 : art.level);
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
      if (process.env.NODE_ENV === "development") console.log(builds.map(build => build?.finalStats?.[this.state.buildFilterKey]))
      this.setState({ builds, generatingBuilds: false })
      // worker.terminate()
      this.worker.terminate()
      delete this.worker
    }

    this.worker.postMessage(data)
  }

  BuildGeneratorEditorCard = (props) => {
    let { setFilters, selectedCharacterId, artifactsAssumeFull } = this.state
    let { statsDisplayKeys } = props
    let charlist = CharacterDatabase.getCharacterDatabase();
    let selectedCharacter = CharacterDatabase.getCharacter(selectedCharacterId)
    let characterName = selectedCharacter ? selectedCharacter.name : "Character Name"
    let artsAccounted = setFilters.reduce((accu, cur) => cur.key ? accu + cur.num : accu, 0)
    //these variables are used for build generator.
    this.split = this.splitArtifacts();
    this.artifactSetPerms = Build.generateAllPossibleArtifactSetPerm(setFilters)
    this.totBuildNumber = Build.calculateTotalBuildNumber(this.split, this.artifactSetPerms, setFilters)
    let { totBuildNumber } = this

    let buildAlert = totBuildNumber === 0 ?
      <Alert variant="warning" className="mb-0"><span>Current configuration will not generate any builds for <b>{characterName}</b>. Please change your Artifact configurations, or add/unlock more Artifacts.</span></Alert>
      : (totBuildNumber > this.state.maxBuildsToGenerate ?
        <Alert variant="danger" className="mb-0"><span>Current configuration will generate <b>{totBuildNumber}</b> builds for <b>{characterName}</b>. Please restrict artifact configuration to reduce builds to less than {this.state.maxBuildsToGenerate}, or your browser might crash.</span></Alert> :
        <Alert variant="success" className="mb-0"><span>Current configuration {totBuildNumber <= this.state.maxBuildsToShow ? "generated" : "will generate"} <b>{totBuildNumber}</b> builds for <b>{characterName}</b>.</span></Alert>)
    let characterDropDown = <DropdownButton title={selectedCharacterId ? characterName : "Select Character"}>
      <Dropdown.Item onClick={() => this.setState({ selectedCharacterId: "", builds: [], buildFilterKey: "atk_final" })}>No Character</Dropdown.Item>
      {Object.values(charlist).map((char, i) =>
        <Dropdown.Item key={char.name + i}
          onClick={() => this.setState({ selectedCharacterId: char.id, builds: [], buildFilterKey: "atk_final" })}
        >
          {char.name}
        </Dropdown.Item>)}
    </DropdownButton>
    const toggleArtifactsAssumeFull = () => this.setState(state => ({ artifactsAssumeFull: !state.artifactsAssumeFull }), this.autoGenerateBuilds)
    return <Card bg="darkcontent" text="lightfont">
      <Card.Header>Build Generator</Card.Header>
      <Card.Body>
        <Row >
          <Col xs={12} lg={6} className="mb-2">
            {/* character selection */}
            {selectedCharacterId ?
              <CharacterCard header={characterDropDown} characterId={selectedCharacterId} bg={"lightcontent"} footer={false} cardClassName="mb-2" onEdit={() => this.setState({ editCharacter: true })} /> :
              <Card bg="lightcontent" text="lightfont" className="mb-2">
                <Card.Header>
                  {characterDropDown}
                </Card.Header>
              </Card>}
            {/* main stat selector */}
            <Card bg="lightcontent" text="lightfont">
              <Card.Header>
                <span>Artifact Main Stat</span>
                <Button className="float-right text-right" variant={artifactsAssumeFull ? "orange" : "primary"} onClick={toggleArtifactsAssumeFull}><FontAwesomeIcon icon={artifactsAssumeFull ? faCheckSquare : faSquare} className="fa-fw" /> Assume Fully Leveled</Button>
              </Card.Header>
              <Card.Body>
                {BuildDisplay.artifactsSlotsToSelectMainStats.map((slotKey, index) =>
                (<div className="text-inline mb-1 d-flex justify-content-between" key={slotKey}>
                  <h6 className="d-inline mr-2">
                    {Artifact.getSlotNameWithIcon(slotKey)}
                  </h6>
                  <DropdownButton
                    title={this.state.mainStat[index] ? Stat.getStatNameWithPercent(this.state.mainStat[index]) : "Select a mainstat"}
                    className="d-inline">
                    <Dropdown.Item onClick={() => this.changeMainStat(index, "")} >No MainStat</Dropdown.Item>
                    {Artifact.getSlotMainStatKeys(slotKey).map(mainStatKey =>
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
            {setFilters.map((setFilter, index) => {
              let { key: setKey, num } = setFilter
              let { artifactConditionals } = this.state
              return (<Col className="mb-2" key={index} xs={12}>
                <Card className="h-100" bg="lightcontent" text="lightfont">
                  <Card.Header>
                    <ButtonGroup>
                      {/* Artifact set */}
                      <DropdownButton as={ButtonGroup} title={Artifact.getSetName(setFilter.key, "Set (Optional)")} >
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
                        {Object.keys(Artifact.getSetEffectsObj(setFilter.key)).map(num => {
                          let artsAccountedOther = setFilters.reduce((accu, cur) => (cur.key && cur.key !== setFilter.key) ? accu + cur.num : accu, 0)
                          return (parseInt(num) + artsAccountedOther <= 5) &&
                            (<Dropdown.Item key={num}
                              onClick={() => this.setState((state) => {
                                let setFilters = state.setFilters;
                                setFilters[index].num = parseInt(num)
                                return { setFilters }
                              }, this.autoGenerateBuilds)}
                            >
                              {`${num}-set`}
                            </Dropdown.Item>)
                        })}
                      </DropdownButton>
                    </ButtonGroup>
                  </Card.Header>
                  {setKey ? <Card.Body><Row>
                    {Object.keys(Artifact.getSetEffectsObj(setKey)).filter(setNkey => parseInt(setNkey) <= num).map(setNumKey => {
                      let setStats = Artifact.getArtifactSetNumStats(setKey, setNumKey)
                      let conditionalNum = 0;
                      let conditional = Artifact.getSetEffectConditional(setKey, setNumKey)
                      if (conditional) {
                        conditionalNum = ConditionalsUtil.getConditionalNum(artifactConditionals, { srcKey: setKey, srcKey2: setNumKey })
                        Object.entries(Artifact.getConditionalStats(setKey, setNumKey, conditionalNum)).forEach(([statKey, val]) =>
                          setStats[statKey] = (setStats[statKey] || 0) + val)
                      }
                      let setStateArtifactConditional = (conditionalNum) => this.setState(state =>
                        ({ artifactConditionals: ConditionalsUtil.setConditional(state.artifactConditionals, { srcKey: setKey, srcKey2: setNumKey }, conditionalNum) }), this.autoGenerateBuilds)
                      let conditionalElement = <ConditionalSelector
                        conditional={conditional}
                        conditionalNum={conditionalNum}
                        setConditional={setStateArtifactConditional}
                        defEle={<Badge variant="success">{setNumKey}-Set</Badge>}
                      />
                      return <Col key={setNumKey} xs={12} className="mb-2">
                        <h6>{conditionalElement} {Artifact.getSetEffectText(setKey, setNumKey)}</h6>
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
          <Col>{selectedCharacterId && buildAlert}</Col>
        </Row>
        <Row className="d-flex justify-content-between">
          <Col xs="auto" >
            <Button
              className="h-100"
              disabled={!selectedCharacterId || totBuildNumber > this.state.maxBuildsToGenerate || this.state.generatingBuilds}
              variant={(selectedCharacterId && totBuildNumber <= this.state.maxBuildsToGenerate) ? "success" : "danger"}
              onClick={this.generateBuilds}
            ><span>Generate Builds</span></Button>
          </Col>
          <Col xs="auto">
            {/* Dropdown to select sorting value */}
            <ButtonGroup>
              <DropdownButton disabled={!selectedCharacterId} title={<span>Sort by <b>{Stat.getStatNameWithPercent(this.state.buildFilterKey)}</b></span>} as={ButtonGroup}>
                {selectedCharacterId && statsDisplayKeys.map(key =>
                  <Dropdown.Item key={key} onClick={() => this.setState({ buildFilterKey: key }, this.autoGenerateBuilds)}>
                    {Stat.getStatNameWithPercent(key)}
                  </Dropdown.Item>
                )}
              </DropdownButton>
              <Button onClick={() => this.setState(state => ({ asending: !state.asending }), this.autoGenerateBuilds)}>
                <FontAwesomeIcon icon={this.state.asending ? faSortAmountDownAlt : faSortAmountUp} className="fa-fw" />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  }
  ArtifactDisplayItem = (props) => {
    let { build, statsDisplayKeys } = props
    return (<div>
      <ListGroup.Item
        variant={props.index % 2 ? "customdark" : "customdarker"} className="text-white" action
        onClick={() => this.setState({ modalBuild: build })}
      >
        <Row>
          <Col>{Object.entries(build.setToSlots).sort(([key1, slotarr1], [key2, slotarr2]) => slotarr2.length - slotarr1.length).map(([key, slotarr]) =>
            <Badge key={key} variant="primary" className="mr-2">
              {slotarr.map(slotKey => Artifact.getSlotIcon(slotKey))} {Artifact.getSetName(key)}
            </Badge>
          )}</Col>
        </Row>
        <Row>
          {statsDisplayKeys.map(key =>
            <Col className="text-nowrap" key={key} xs={12} sm={6} lg={4}>
              <span>{Stat.getStatName(key)}: <span className="text-warning">{build.finalStats[key]?.toFixed?.(Stat.fixedUnit(key)) || build.finalStats[key]}{Stat.getStatUnit(key)}</span></span>
            </Col>
          )}
        </Row>
      </ListGroup.Item>
    </div>)
  }
  closeModal = () => this.setState({ modalBuild: null, editCharacter: false })
  BuildModal = (props) => {
    let { build, characterid } = props
    let { editCharacter } = this.state
    return <Modal show={Boolean(editCharacter || build)} onHide={this.closeModal} size="xl" contentClassName="bg-transparent">
      <React.Suspense fallback={<span>Loading...</span>}>
        <CharacterDisplayCard characterId={characterid} newBuild={build}
          onClose={this.closeModal}
          forceUpdate={this.forceUpdateBuildDisplay}
          editable={editCharacter}
          footer={<Button variant="danger" onClick={this.closeModal}>Close</Button>} />
      </React.Suspense>
    </Modal>
  }

  componentDidMount() {
    Promise.all([
      Character.getCharacterDataImport(),
      Weapon.getWeaponDataImport(),
      Artifact.getDataImport()
    ]).then(() => {
      this.forceUpdate()
      //try to generate a build at the beginning after mount.
      this.autoGenerateBuilds()
    })
  }
  componentDidUpdate() {
    let state = deepClone(this.state)
    state.builds = [];
    delete state.generatingBuilds
    delete state.modalBuild
    delete state.editCharacter
    saveToLocalStorage("BuildsDisplay.state", state)
  }
  componentWillUnmount() {
    this.worker?.terminate()
    delete this.worker
  }
  render() {
    let { selectedCharacterId, modalBuild, maxBuildsToShow, builds = [] } = this.state
    let selectedCharacter = CharacterDatabase.getCharacter(selectedCharacterId)
    let characterKey = selectedCharacter?.characterKey
    let characterName = Character.getName(characterKey, "Character Name")
    let statsDisplayKeys = Character.getDisplayStatKeys(characterKey)
    return (<Container>
      <this.BuildModal build={modalBuild} characterid={selectedCharacterId} />
      <Row className="mt-2 mb-2">
        <Col>
          {/* Build Generator Editor */}
          <this.BuildGeneratorEditorCard statsDisplayKeys={statsDisplayKeys} />
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <Card bg="darkcontent" text="lightfont">
            <Card.Header>{selectedCharacterId ? `Showing ${builds.length} Builds generated for ${characterName}` : "Select a character to generate builds."}</Card.Header>
            {/* Build List */}
            <ListGroup>
              {builds.map((build, index) =>
                (index < maxBuildsToShow) && <this.ArtifactDisplayItem build={build} character={selectedCharacter} index={index} key={Object.values(build.artifactIds).join("_")} statsDisplayKeys={statsDisplayKeys} />
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>)
  }
}