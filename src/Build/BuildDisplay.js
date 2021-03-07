import { faCheckSquare, faSortAmountDownAlt, faSortAmountUp, faSquare, faTimes, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { lazy } from 'react';
import { Alert, Badge, Button, ButtonGroup, Card, Col, Container, Dropdown, DropdownButton, Image, InputGroup, ListGroup, Modal, ProgressBar, Row } from 'react-bootstrap';
import ReactGA from 'react-ga';
// eslint-disable-next-line
import Worker from "worker-loader!./BuildWorker.js";
import Artifact from '../Artifact/Artifact';
import ArtifactDatabase from '../Artifact/ArtifactDatabase';
import Character from '../Character/Character';
import CharacterCard from '../Character/CharacterCard';
import CharacterDatabase from '../Character/CharacterDatabase';
import { HitModeToggle, ReactionToggle } from '../Character/CharacterDisplay/DamageOptionsAndCalculation';
import StatDisplayComponent from '../Character/CharacterDisplay/StatDisplayComponent';
import { CharacterSelectionDropdownList } from '../Components/CharacterSelection';
import ConditionalSelector from '../Components/ConditionalSelector';
import CustomFormControl from '../Components/CustomFormControl';
import { Stars } from '../Components/StarDisplay';
import { DatabaseInitAndVerify } from '../DatabaseUtil';
import Stat from '../Stat';
import { GetDependencies, reduceOptimizationTarget } from '../StatDependency';
import ConditionalsUtil from '../Util/ConditionalsUtil';
import { timeStringMs } from '../Util/TimeUtil';
import { deepClone, getObjectKeysRecursive, loadFromLocalStorage, saveToLocalStorage } from '../Util/Util';
import Weapon from '../Weapon/Weapon';
import { calculateTotalBuildNumber } from './Build';

//lazy load the character display
const CharacterDisplayCardPromise = import('../Character/CharacterDisplayCard');
const CharacterDisplayCard = lazy(() => CharacterDisplayCardPromise)

const warningBuildNumber = 10000000
export default class BuildDisplay extends React.Component {
  constructor(props) {
    super(props)
    DatabaseInitAndVerify();
    this.state = BuildDisplay.getInitialState();
    if ("BuildsDisplay.state" in localStorage) {
      const { characterKey = "" } = loadFromLocalStorage("BuildsDisplay.state")
      this.state = { ...this.state, characterKey }
    }
    if (props.location.characterKey) //override the one stored in BuildsDisplay.state
      this.state.characterKey = props.location.characterKey

    if (this.state.characterKey) {
      const character = CharacterDatabase.get(this.state.characterKey)
      if (character)
        this.state = { ...this.state, ...(character?.buildSetting ?? {}) }
      else
        this.state.characterKey = ""
    }
    ReactGA.pageview('/build')
  }
  static initialState = {
    builds: [],
    generatingBuilds: false,
    characterKey: "",
    setFilters: [{ key: "", num: 0 }, { key: "", num: 0 }, { key: "", num: 0 }],
    statFilters: {},
    artifactConditionals: [],//{ setKey: "", setNumKey: "", conditionalNum: 0 }
    mainStat: ["", "", ""],
    optimizationTarget: "finalATK",
    artifactsAssumeFull: false,
    useLockedArts: false,
    ascending: false,
    modalBuild: null,
    showArtCondModal: false,
    showCharacterModal: false,
    maxBuildsToShow: 100,
    generationProgress: 0,
    generationDuration: 0,//in ms
  }
  static maxBuildsToShowList = [100, 50, 25, 5]
  static getInitialState = () => deepClone(BuildDisplay.initialState)
  static artifactsSlotsToSelectMainStats = ["sands", "goblet", "circlet"]
  forceUpdateBuildDisplay = () => this.forceUpdate()

  selectCharacter = (characterKey = "") => {
    if (!characterKey)
      return this.setState({ ...BuildDisplay.getInitialState(), characterKey: "" })
    const character = CharacterDatabase.get(characterKey)
    if (character)
      return this.setState(state => ({ ...BuildDisplay.getInitialState(), characterKey, ...(character?.buildSetting ?? {}), showCharacterModal: state.showCharacterModal }))
  }
  splitArtifacts = () => {
    if (!this.state.characterKey) // Make sure we have all slotKeys
      return Object.fromEntries(Artifact.getSlotKeys().map(slotKey => [slotKey, []]))
    let artifactDatabase = ArtifactDatabase.getArtifactDatabase();
    //do not use artifacts that are locked.
    if (!this.state.useLockedArts)
      Object.entries(artifactDatabase).forEach(([key, val]) => {
        //if its equipped on the selected character, bypass the lock check
        if (this.state.characterKey && val.location === this.state.characterKey) return
        //if its locked, or equipped, remove from consideration
        if (val.lock || val.location)
          delete artifactDatabase[key]
      })
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
    let setFilters = state.setFilters;
    let num = 0
    //automatically select the 1st element from setsNumArr
    if (setsNumArr && setsNumArr[0])
      num = parseInt(setsNumArr[0])
    setFilters[index] = { key: newkey, num }
    return { setFilters }
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
  autoGenerateBuilds = () => {
    if (typeof this.totBuildNumber === "number" && this.totBuildNumber <= this.state.maxBuildsToShow)
      this.generateBuilds()
    else if (this.state.builds.length) this.setState({ builds: [], generationProgress: 0, generationDuration: 0 })
  }

  generateBuilds = () => {
    let { split, totBuildNumber } = this
    if (!totBuildNumber) return this.setState({ builds: [] })
    this.setState({ generatingBuilds: true, builds: [], generationDuration: 0, generationProgress: 0 })
    let { characterKey, setFilters, statFilters = {}, ascending, optimizationTarget, maxBuildsToShow, artifactConditionals, artifactsAssumeFull } = this.state
    const character = CharacterDatabase.get(characterKey)
    //get the formula for this targer
    if (typeof optimizationTarget === "object") {
      const { talentKey, sectionIndex, fieldIndex } = optimizationTarget
      let { formula } = Character.getTalentField(characterKey, talentKey, sectionIndex, fieldIndex)
      optimizationTarget = typeof formula === "function" ? formula(Character.getTalentLevelKey(character, talentKey), {}, character) : formula
    }
    //if the formula is a simple one, convert it back to a statKey
    optimizationTarget = reduceOptimizationTarget(optimizationTarget)
    const optimiztionTargetDependencies = getObjectKeysRecursive(optimizationTarget)

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
    const minFilters = Object.fromEntries(Object.entries(statFilters).map(([statKey, { min }]) => [statKey, min]).filter(([, min]) => typeof min === "number"))
    const maxFilters = Object.fromEntries(Object.entries(statFilters).map(([statKey, { max }]) => [statKey, max]).filter(([, max]) => typeof max === "number"))
    let dependencies = GetDependencies(initialStats?.modifiers, [...optimiztionTargetDependencies, ...Object.keys(minFilters), ...Object.keys(maxFilters)])

    //create an obj with app the artifact set effects to pass to buildworker.
    let data = {
      splitArtifacts, initialStats, artifactSetEffects, dependencies,
      setFilters, minFilters, maxFilters, maxBuildsToShow, optimizationTarget, ascending,
    }
    if (this.worker) this.worker.terminate()
    this.worker = new Worker();
    this.worker.onmessage = (e) => {
      if (typeof e.data.progress === "number") {
        const { progress = 0, timing = 0 } = e.data
        return this.setState({ generationProgress: progress, generationDuration: timing })
      }
      ReactGA.timing({
        category: "Build Generation",
        variable: "timing",
        value: e.data.timing,
        label: this.totBuildNumber
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

  BuildGeneratorEditorCard = ({ statsDisplayKeys }) => {
    let { setFilters, statFilters = {}, characterKey, artifactsAssumeFull, artifactConditionals, useLockedArts, generatingBuilds, generationProgress, generationDuration, optimizationTarget, ascending } = this.state
    let characterName = Character.getName(characterKey, "Character Name")
    let artsAccounted = setFilters.reduce((accu, cur) => cur.key ? accu + cur.num : accu, 0)
    //these variables are used for build generator.
    this.split = this.splitArtifacts();
    this.totBuildNumber = calculateTotalBuildNumber(this.split, setFilters)
    let { totBuildNumber } = this
    let totalBuildNumberString = totBuildNumber?.toLocaleString() ?? totBuildNumber
    let generationProgressString = generationProgress?.toLocaleString() ?? generationProgress
    let buildAlert = null
    if (generatingBuilds) {
      let progPercent = generationProgress * 100 / totBuildNumber
      buildAlert = <Alert variant="success">
        <span>Generating and testing <b>{generationProgressString}/{totalBuildNumberString}</b> Build configurations against the criterias for <b>{characterName}</b></span>
        <h6>Time elapsed: {timeStringMs(generationDuration)}</h6>
        <ProgressBar now={progPercent} label={`${progPercent.toFixed(1)}%`} />
      </Alert>
    } else if (!generatingBuilds && generationProgress) {//done
      buildAlert = <Alert variant="success">
        <span>Generated and tested <b>{totalBuildNumberString}</b> Build configurations against the criterias for <b>{characterName}</b></span>
        <h6>Time elapsed: {timeStringMs(generationDuration)}</h6>
        <ProgressBar now={100} variant="success" label="100%" />
      </Alert>
    } else {
      buildAlert = totBuildNumber === 0 ?
        <Alert variant="warning" className="mb-0"><span>Current configuration will not generate any builds for <b>{characterName}</b>. Please change your Artifact configurations, or add/unlock more Artifacts.</span></Alert>
        : (totBuildNumber > warningBuildNumber ?
          <Alert variant="warning" className="mb-0"><span>Current configuration will generate <b>{totalBuildNumberString}</b> builds for <b>{characterName}</b>. This might take quite awhile to generate...</span></Alert> :
          <Alert variant="success" className="mb-0"><span>Current configuration {totBuildNumber <= this.state.maxBuildsToShow ? "generated" : "will generate"} <b>{totalBuildNumberString}</b> builds for <b>{characterName}</b>.</span></Alert>)
    }
    let characterDropDown = <DropdownButton title={Character.getName(characterKey, "Select Character")} disabled={generatingBuilds}>
      <Dropdown.Item onClick={() => this.selectCharacter("")}>Unselect Character</Dropdown.Item>
      <Dropdown.Divider />
      <CharacterSelectionDropdownList onSelect={cKey => this.selectCharacter(cKey)} />
    </DropdownButton>
    const toggleArtifactsAssumeFull = () => this.setState(state => ({ artifactsAssumeFull: !state.artifactsAssumeFull }), this.autoGenerateBuilds)
    return <Card bg="darkcontent" text="lightfont">
      <Card.Header>Build Generator</Card.Header>
      <Card.Body>
        <Row >
          <Col xs={12} lg={6}>
            {/* character selection */}
            {characterKey ?
              <CharacterCard header={characterDropDown} characterKey={characterKey} bg={"lightcontent"} footer={false} cardClassName="mb-2" onEdit={!generatingBuilds ? () => this.setState({ showCharacterModal: true }) : null} /> :
              <Card bg="lightcontent" text="lightfont" className="mb-2">
                <Card.Header>
                  {characterDropDown}
                </Card.Header>
              </Card>}
            {/* Hit mode options */}
            <HitModeCard characterKey={characterKey} forceUpdate={() => { this.forceUpdateBuildDisplay(); this.autoGenerateBuilds() }} />
            {/* Final Stat Filter */}
            <StatFilterCard statFilters={statFilters} statsDisplayKeys={statsDisplayKeys} setStatFilters={sFs => this.setState({ statFilters: sFs })} />
          </Col>
          <Col xs={12} lg={6}><Row>
            <Col className="mb-2" xs={12}>
              <Card bg="lightcontent" text="lightfont"><Card.Body>
                <Button className="w-100" onClick={() => this.setState({ showArtCondModal: true })} disabled={generatingBuilds}>
                  <span>Default Artifact Set Effects {Boolean(artifactConditionals.length) && <Badge variant="success">{artifactConditionals.length} Selected</Badge>}</span>
                </Button>
              </Card.Body></Card>
            </Col>
            {/* Artifact set picker */}
            {setFilters.map(({ key: setKey, num: setNum }, index) => <Col className="mb-2" key={index} xs={12}>
              <Card className="h-100" bg="lightcontent" text="lightfont">
                <Card.Header>
                  <ButtonGroup>
                    {/* Artifact set */}
                    <DropdownButton as={ButtonGroup} title={Artifact.getSetName(setKey, "Artifact Set Filter")} disabled={generatingBuilds}>
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
                    <DropdownButton as={ButtonGroup} title={`${setNum}-set`}
                      disabled={generatingBuilds || !setKey || artsAccounted >= 5}
                    >
                      {Object.keys(Artifact.getSetEffectsObj(setKey)).map(num => {
                        let artsAccountedOther = setFilters.reduce((accu, cur) => (cur.key && cur.key !== setKey) ? accu + cur.num : accu, 0)
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
                  {Object.keys(Artifact.getSetEffectsObj(setKey)).filter(setNkey => parseInt(setNkey) <= setNum).map(setNumKey => {
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
            </Col>)}
            <Col className="mb-2" xs={12}>
              <Card bg="lightcontent" text="lightfont"><Card.Body>
                <Button className="w-100" onClick={() => this.setState(state => ({ useLockedArts: !state.useLockedArts }), this.autoGenerateBuilds)} disabled={generatingBuilds}>
                  <span><FontAwesomeIcon icon={useLockedArts ? faCheckSquare : faSquare} /> {useLockedArts ? "Use Locked & Equipped Artifacts" : "Do not use Locked & Equipped Artifacts"}</span>
                </Button>
              </Card.Body></Card>
            </Col>
            {/* main stat selector */}
            <Col className="mb-2" xs={12}>
              <Card bg="lightcontent" text="lightfont">
                <Card.Header>
                  <span>Artifact Main Stat</span>
                  <Button className="float-right text-right" variant={artifactsAssumeFull ? "orange" : "primary"} onClick={toggleArtifactsAssumeFull} disabled={generatingBuilds}>
                    <span><FontAwesomeIcon icon={artifactsAssumeFull ? faCheckSquare : faSquare} className="fa-fw" /> Assume Fully Leveled</span>
                  </Button>
                </Card.Header>
                <Card.Body className="mb-n2">
                  {BuildDisplay.artifactsSlotsToSelectMainStats.map((slotKey, index) =>
                  (<div className="text-inline mb-1 d-flex justify-content-between" key={slotKey}>
                    <h6 className="d-inline mb-0">
                      {Artifact.getSlotNameWithIcon(slotKey)}
                    </h6>
                    <DropdownButton disabled={generatingBuilds} size="sm"
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
          </Row></Col>
        </Row>
        <Row className="mb-2">
          <Col>{characterKey && buildAlert}</Col>
        </Row>
        <Row className="d-flex justify-content-between">
          <Col xs="auto" >
            <ButtonGroup>
              <Button
                className="h-100"
                disabled={!characterKey || generatingBuilds}
                variant={(characterKey && totBuildNumber <= warningBuildNumber) ? "success" : "warning"}
                onClick={this.generateBuilds}
              ><span>Generate Builds</span></Button>
              <Button
                className="h-100"
                disabled={!generatingBuilds}
                variant="danger"
                onClick={() => {
                  if (this.worker) {
                    this.worker.terminate()
                    delete this.worker
                    this.setState({ generatingBuilds: false, builds: [], generationDuration: 0, generationProgress: 0 })
                  }
                }}
              ><span>Cancel</span></Button>
            </ButtonGroup>
          </Col>
          <Col xs="auto">
            {/* Dropdown to select sorting value */}
            <SortByStatDropdown
              characterKey={characterKey}
              disabled={generatingBuilds || !characterKey}
              autoGenerateBuilds={this.autoGenerateBuilds}
              setState={(updater) => this.setState(updater, this.autoGenerateBuilds)}
              optimizationTarget={optimizationTarget}
              ascending={ascending}
              statsDisplayKeys={statsDisplayKeys}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  }
  closeModal = () => this.setState({ modalBuild: null, showCharacterModal: false })
  BuildModal = ({ build, characterKey }) => {
    let { showCharacterModal } = this.state
    return <Modal show={Boolean(showCharacterModal || build)} onHide={this.closeModal} size="xl" contentClassName="bg-transparent">
      <React.Suspense fallback={<span>Loading...</span>}>
        <CharacterDisplayCard
          characterKey={characterKey}
          setCharacterKey={cKey => this.selectCharacter(cKey)}
          newBuild={build}
          onClose={this.closeModal}
          forceUpdate={this.forceUpdateBuildDisplay}
          editable={showCharacterModal}
          footer={<Button variant="danger" onClick={this.closeModal}>Close</Button>} />
      </React.Suspense>
    </Modal>
  }
  closeArtCondModal = () => this.setState({ showArtCondModal: false })
  ArtConditionalModal = () => {
    let { showArtCondModal, artifactConditionals } = this.state
    let artSetKeyList = [5, 4, 3].map(s => Artifact.getSetsByMaxStarEntries(s).map(([key]) => key)).flat()
    return <Modal show={showArtCondModal} onHide={this.closeArtCondModal} size="xl" contentClassName="bg-transparent">
      <Card bg="darkcontent" text="lightfont" >
        <Card.Header>
          <Row>
            <Col>
              <h5>Default Artifact Set Effects  {Boolean(artifactConditionals.length) && <Badge variant="success">{artifactConditionals.length} Selected</Badge>}</h5>
            </Col>
            <Col xs="auto" >
              <Button onClick={() => this.setState({ artifactConditionals: [] })}><span><FontAwesomeIcon icon={faUndo} /> Reset All</span></Button>
            </Col>
            <Col xs="auto" >
              <Button variant="danger" onClick={this.closeArtCondModal}>
                <FontAwesomeIcon icon={faTimes} /></Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row>
            {artSetKeyList.map(setKey => {
              let icon = Artifact.getPieceIcon(setKey, Object.keys(Artifact.getPieces(setKey))?.[0])
              let numStars = [...Artifact.getRarityArr(setKey)].pop() || 1
              return <Col className="mb-2" key={setKey} xs={12} lg={6} xl={4}>
                <Card className="h-100" bg="lightcontent" text="lightfont">
                  <Card.Header >
                    <Row>
                      <Col xs="auto" className="ml-n3 my-n2">
                        <Image src={icon} className={`thumb-mid grad-${numStars}star m-1`} thumbnail />
                      </Col>
                      <Col >
                        <h6><b>{Artifact.getSetName(setKey)}</b></h6>
                        <span><Stars stars={numStars} /></span>
                      </Col>
                    </Row>
                  </Card.Header>
                  <Card.Body><Row>
                    {Object.keys(Artifact.getSetEffectsObj(setKey)).map(setNumKey => {
                      let setStats = Artifact.getArtifactSetNumStats(setKey, setNumKey)
                      let conditionalNum = 0;
                      let conditional = Artifact.getSetEffectConditional(setKey, setNumKey)
                      if (conditional) {
                        conditionalNum = ConditionalsUtil.getConditionalNum(artifactConditionals, { srcKey: setKey, srcKey2: setNumKey })
                        Object.entries(Artifact.getConditionalStats(setKey, setNumKey, conditionalNum)).forEach(([statKey, val]) =>
                          setStats[statKey] = (setStats[statKey] || 0) + val)
                      }
                      let setStateArtifactConditional = (conditionalNum) => this.setState(state =>
                        ({ artifactConditionals: ConditionalsUtil.setConditional(state.artifactConditionals, { srcKey: setKey, srcKey2: setNumKey }, conditionalNum) }),
                        this.autoGenerateBuilds())
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
                  </Row></Card.Body>
                </Card>
              </Col>
            })}
          </Row>
        </Card.Body>
        <Card.Footer>
          <Button variant="danger" onClick={this.closeArtCondModal}>
            <FontAwesomeIcon icon={faTimes} /> CLOSE</Button>
        </Card.Footer>
      </Card>
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
  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.characterKey !== this.state.characterKey) {
      let { characterKey } = this.state
      saveToLocalStorage("BuildsDisplay.state", { characterKey })
    }

    if (this.state.characterKey) {
      let character = CharacterDatabase.get(this.state.characterKey)
      if (!character) return
      const { setFilters, statFilters, artifactConditionals, mainStat, optimizationTarget, artifactsAssumeFull, useLockedArts, ascending } = deepClone(this.state)
      character.buildSetting = { setFilters, statFilters, artifactConditionals, mainStat, optimizationTarget, artifactsAssumeFull, useLockedArts, ascending }
      CharacterDatabase.updateCharacter(character)
    }
  }
  componentWillUnmount() {
    this.worker?.terminate()
    delete this.worker
  }
  render() {
    let { characterKey, modalBuild, maxBuildsToShow, builds = [] } = this.state
    let characterName = Character.getName(characterKey, "Character Name")
    let statsDisplayKeys = Character.getDisplayStatKeys(characterKey)
    return (<Container>
      <this.BuildModal build={modalBuild} characterKey={characterKey} />
      <this.ArtConditionalModal />
      <Row className="mt-2 mb-2">
        <Col>
          {/* Build Generator Editor */}
          <this.BuildGeneratorEditorCard statsDisplayKeys={statsDisplayKeys} />
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <Card bg="darkcontent" text="lightfont">
            <Card.Header>{characterKey ? `Showing ${builds.length} Builds generated for ${characterName}` : "Select a character to generate builds."}</Card.Header>
            {/* Build List */}
            <ListGroup>
              {builds.map((build, index) =>
                (index < maxBuildsToShow) && <ArtifactDisplayItem build={build} characterKey={characterKey} index={index} key={Object.values(build.artifactIds).join("_")} statsDisplayKeys={statsDisplayKeys} setState={s => this.setState(s)} />
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>)
  }
}
function SortByStatDropdown({ characterKey, statsDisplayKeys, disabled, optimizationTarget, ascending, setState }) {
  const character = CharacterDatabase.get(characterKey)
  if (!character) return null
  let sortByText = "VALUE"
  if (typeof optimizationTarget === "object") {
    const { talentKey, sectionIndex, fieldIndex } = optimizationTarget
    let { variant = "", text } = Character.getTalentField(characterKey, talentKey, sectionIndex, fieldIndex)
    variant = typeof variant === "function" ? variant?.(Character.getTalentLevelKey(character, talentKey), {}, character) : variant
    sortByText = <b>{Character.getTalentName(characterKey, talentKey)}: <span className={`text-${variant}`}>{text}</span></b>
  } else
    sortByText = <b>Basic Stat: <span className={`text-${Stat.getStatVariant(optimizationTarget)}`}>{Stat.getStatNamePretty(optimizationTarget)}</span></b>

  return <ButtonGroup>
    <Dropdown as={ButtonGroup}>
      <Dropdown.Toggle disabled={disabled} >
        <span>Sort by {sortByText}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu drop="up" align="right" style={{ minWidth: "35rem" }} >
        <Row>
          {Object.entries(statsDisplayKeys).map(([talentKey, fields]) => {
            let header = ""
            if (talentKey === "basicKeys") header = "Basic Stats"
            else if (talentKey === "genericAvgHit") header = "Generic Optimization Values"
            else if (talentKey === "transReactions") header = "Transformation Reaction"
            else header = Character.getTalentName(characterKey, talentKey, talentKey)
            return <Col xs={12} md={6} key={talentKey}>
              <Dropdown.Header><b>{header}</b></Dropdown.Header>
              {fields.map((field, i) => {
                if (typeof field === "string")
                  return <Dropdown.Item key={i} onClick={() => setState({ optimizationTarget: field })}>{Stat.getStatNamePretty(field)}</Dropdown.Item>
                const talentField = Character.getTalentField(characterKey, field.talentKey, field.sectionIndex, field.fieldIndex)
                return <Dropdown.Item key={i} onClick={() => setState({ optimizationTarget: field })}>
                  <span className={`text-${Character.getTalentFieldValue(talentField, "variant", talentKey, character, {})}`}>{Character.getTalentFieldValue(talentField, "text", talentKey, character, {})}</span>
                </Dropdown.Item>
              })}
            </Col>
          })}
        </Row>
      </Dropdown.Menu>
    </Dropdown>
    <Button onClick={() => setState(state => ({ ascending: !state.ascending }))} disabled={disabled}>
      <FontAwesomeIcon icon={ascending ? faSortAmountDownAlt : faSortAmountUp} className="fa-fw" />
    </Button>
  </ButtonGroup >
}
function StatFilterItem({ statKey, statKeys = [], min, max, close, setFilter }) {
  const isFloat = Stat.getStatUnit(statKey) === "%"
  const inputProps = {
    disabled: !statKey,
    allowEmpty: true,
    float: isFloat,
  }
  const minInputProps = {
    ...inputProps,
    placeholder: "MIN",
    value: min,
    onValueChange: (s) => setFilter(statKey, s, max)
  }
  const maxInputProps = {
    ...inputProps,
    placeholder: "MAX",
    value: max,
    onValueChange: (s) => setFilter(statKey, min, s)
  }
  return <InputGroup className="mb-2">
    <DropdownButton
      as={InputGroup.Prepend}
      title={Stat.getStatNamePretty(statKey, "New Stat")}
      id="input-group-dropdown-1"
    >
      {statKeys.map(sKey => <Dropdown.Item key={sKey} onClick={() => { close?.(); setFilter(sKey, min, max) }}>{Stat.getStatNamePretty(sKey)}</Dropdown.Item>)}
    </DropdownButton>
    <CustomFormControl {...minInputProps} />
    <CustomFormControl {...maxInputProps} />
    {Boolean(close) && <InputGroup.Append>
      <Button variant="danger" onClick={close}><FontAwesomeIcon icon={faTrash} /></Button>
    </InputGroup.Append>}
  </InputGroup>
}

function HitModeCard({ characterKey, forceUpdate }) {
  const character = CharacterDatabase.get(characterKey)
  const { hitMode } = character
  const setHitmode = v => {
    const char = CharacterDatabase.get(characterKey)
    char.hitMode = v;
    CharacterDatabase.updateCharacter(char)
    forceUpdate()
  }
  const setReactionMode = r => {
    const char = CharacterDatabase.get(characterKey)
    char.reactionMode = r;
    CharacterDatabase.updateCharacter(char)
    forceUpdate()
  }
  return <Card bg="lightcontent" text="lightfont">
    <Card.Header>Hit Mode Options</Card.Header>
    <Card.Body>
      <HitModeToggle hitMode={hitMode} setHitMode={setHitmode} className="w-100" />
      <ReactionToggle character={character} setReactionMode={setReactionMode} className="w-100 mt-2" />
    </Card.Body>
  </Card >
}

function StatFilterCard({ statsDisplayKeys = { basicKeys: [] }, statFilters = {}, setStatFilters }) {
  const remainingKeys = statsDisplayKeys.basicKeys.filter(key => !Object.keys(statFilters).some(k => k === key))
  const setFilter = (sKey, min, max) => setStatFilters({ ...statFilters, [sKey]: { min, max } })
  return <Card bg="lightcontent" text="lightfont">
    <Card.Header>Final Stat Filter</Card.Header>
    <Card.Body>
      <Row className="mb-n2">
        {Object.entries(statFilters).map(([statKey, { min, max }]) => {
          return <Col xs={12} key={statKey} ><StatFilterItem statKey={statKey} statKeys={remainingKeys} setFilter={setFilter} min={min} max={max} close={() => {
            delete statFilters[statKey]
            setStatFilters({ ...statFilters })
          }} /></Col>
        })}
        <Col xs={12}>
          <StatFilterItem statKeys={remainingKeys} setFilter={setFilter} />
        </Col>
      </Row>
    </Card.Body>
  </Card>
}

//for displaying each artifact build
function ArtifactDisplayItem({ index, characterKey, build, statsDisplayKeys, setState }) {
  return (<div>
    <ListGroup.Item
      variant={index % 2 ? "customdark" : "customdarker"} className="text-white" action
      onClick={() => setState({ modalBuild: build })}
    >
      <Row className="mb-2">
        <Col>{Object.entries(build.setToSlots).sort(([key1, slotarr1], [key2, slotarr2]) => slotarr2.length - slotarr1.length).map(([key, slotarr]) =>
          <Badge key={key} variant="primary" className="mr-2">
            {slotarr.map(slotKey => Artifact.getSlotIcon(slotKey))} {Artifact.getSetName(key)}
          </Badge>
        )}</Col>
      </Row>
      <StatDisplayComponent {...{ character: CharacterDatabase.get(characterKey), newBuild: build, statsDisplayKeys, cardbg: (index % 2 ? "lightcontent" : "darkcontent") }} />
    </ListGroup.Item>
  </div>)
}