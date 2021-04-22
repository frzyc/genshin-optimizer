import { faCheckSquare, faSortAmountDownAlt, faSortAmountUp, faSquare, faTimes, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { lazy, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Alert, Badge, Button, ButtonGroup, Card, Col, Container, Dropdown, DropdownButton, Image, InputGroup, ListGroup, Modal, OverlayTrigger, ProgressBar, Row, Tooltip } from 'react-bootstrap';
import ReactGA from 'react-ga';
// eslint-disable-next-line
import Worker from "worker-loader!./BuildWorker.js";
import Artifact from '../Artifact/Artifact';
import SetEffectDisplay from '../Artifact/Component/SetEffectDisplay';
import Character from '../Character/Character';
import CharacterCard from '../Character/CharacterCard';
import { HitModeToggle, ReactionToggle } from '../Character/CharacterDisplay/DamageOptionsAndCalculation';
import StatDisplayComponent from '../Character/CharacterDisplay/StatDisplayComponent';
import { CharacterSelectionDropdownList } from '../Components/CharacterSelection';
import CustomFormControl from '../Components/CustomFormControl';
import { Stars } from '../Components/StarDisplay';
import ArtifactDatabase from '../Database/ArtifactDatabase';
import CharacterDatabase from '../Database/CharacterDatabase';
import Formula, { CharacterFormulaImport } from '../Formula';
import Stat from '../Stat';
import { timeStringMs } from '../Util/TimeUtil';
import { crawlObject, deepClone, loadFromLocalStorage, saveToLocalStorage } from '../Util/Util';
import Weapon from '../Weapon/Weapon';
import { calculateTotalBuildNumber } from './Build';

//lazy load the character display
const CharacterDisplayCardPromise = import('../Character/CharacterDisplayCard');
const CharacterDisplayCard = lazy(() => CharacterDisplayCardPromise)

const warningBuildNumber = 10000000
const maxBuildsToShowList = [50, 25, 10, 5]
const maxBuildsToShowDefault = 25
const autoBuildGenLimit = 100
const artifactsSlotsToSelectMainStats = ["sands", "goblet", "circlet"]
const initialBuildSettings = () => ({
  setFilters: [{ key: "", num: 0 }, { key: "", num: 0 }, { key: "", num: 0 }],
  statFilters: {},
  mainStatKeys: ["", "", ""],
  optimizationTarget: "finalATK",//TODO need to validate
  mainStatAssumptionLevel: 0,
  useLockedArts: false,
  ascending: false,
})

function buildSettingsReducer(state, action) {
  switch (action.type) {
    case 'mainStatKey': {
      const { index, mainStatKey } = action
      state.mainStatKeys[index] = mainStatKey
      return { ...state, mainStatKeys: [...state.mainStatKeys] }//do this because this is a dependency, so needs to be a "new" array
    }
    case `setFilter`: {
      const { index, key, num = 0 } = action
      state.setFilters[index] = { key, num }
      return { ...state, setFilters: [...state.setFilters] }//do this because this is a dependency, so needs to be a "new" array
    }
    default:
      break;
  }
  if (Array.isArray(action.optimizationTarget) && !Formula.get(action.optimizationTarget))
    action.optimizationTarget = "finalATK"

  return { ...state, ...action }
}

export default function BuildDisplay({ location: { characterKey: propCharacterKey } }) {
  const [characterKey, setcharacterKey] = useState("")
  const [buildSettings, buildSettingsDispatch] = useReducer(buildSettingsReducer, initialBuildSettings())
  const { setFilters, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useLockedArts, ascending, } = buildSettings

  const [builds, setbuilds] = useState([])
  const [maxBuildsToShow, setmaxBuildsToShow] = useState(maxBuildsToShowDefault)

  const [modalBuild, setmodalBuild] = useState(null)//the newBuild that is being displayed in the character modal
  const [showArtCondModal, setshowArtCondModal] = useState(false)
  const [showCharacterModal, setshowCharacterModal] = useState(false)

  const [generatingBuilds, setgeneratingBuilds] = useState(false)
  const [generationProgress, setgenerationProgress] = useState(0)
  const [generationDuration, setgenerationDuration] = useState(0)//in ms
  const [generationSkipped, setgenerationSkipped] = useState(0)

  const [charDirty, setcharDirty] = useState({})
  const setCharDirty = useCallback(() => setcharDirty({}), [setcharDirty])

  const prevCharKey = useRef("")
  const isMounted = useRef(false)

  const worker = useRef()

  useEffect(() => {
    Promise.all([
      Character.getCharacterDataImport(),
      Weapon.getWeaponDataImport(),
      Artifact.getDataImport(),
      CharacterFormulaImport,
    ]).then(setCharDirty)
  }, [setCharDirty])

  useEffect(() => ReactGA.pageview('/build'), [])

  //unregister callback when component unmounts
  useEffect(() => () => prevCharKey.current && CharacterDatabase.unregisterCharListener(prevCharKey.current, setCharDirty), [setCharDirty])
  //terminate worker when component unmounts
  useEffect(() => () => worker.current?.terminate(), [])

  //select a new character Key
  const selectCharacter = useCallback((cKey = "") => {
    if (prevCharKey.current === cKey) return
    CharacterDatabase.unregisterCharListener(prevCharKey.current, setCharDirty)
    setcharacterKey(cKey)
    prevCharKey.current = cKey
    CharacterDatabase.registerCharListener(prevCharKey.current, setCharDirty)
    buildSettingsDispatch({ ...initialBuildSettings(), ...(CharacterDatabase.get(cKey)?.buildSettings ?? {}) })
    setbuilds([])
  }, [setCharDirty, setcharacterKey, buildSettingsDispatch])

  useEffect(() => {//startup load from localStorage
    if (!("BuildsDisplay.state" in localStorage)) return
    const { characterKey = "", maxBuildsToShow = maxBuildsToShowDefault } = loadFromLocalStorage("BuildsDisplay.state") ?? {}
    if (characterKey) selectCharacter(characterKey)
    setmaxBuildsToShow(maxBuildsToShow)
  }, [selectCharacter])

  useEffect(() => propCharacterKey && selectCharacter(propCharacterKey), [propCharacterKey, selectCharacter])//update when props update
  const character = useMemo(() => charDirty && CharacterDatabase.get(characterKey), [characterKey, charDirty])
  const initialStats = useMemo(() => charDirty && Character.createInitialStats(character), [character, charDirty])
  const statsDisplayKeys = useMemo(() => charDirty && Character.getDisplayStatKeys(initialStats), [initialStats, charDirty])

  //save build settings to character when buildSettings change, will cause infinite loop if add 'character' to dependency array
  useEffect(() => {
    if (!character) return
    character.buildSettings = buildSettings
    CharacterDatabase.update(character)
  }, [buildSettings]) // eslint-disable-line react-hooks/exhaustive-deps

  //save to BuildsDisplay.state on change
  useEffect(() => {
    if (isMounted.current) {
      saveToLocalStorage("BuildsDisplay.state", { characterKey, maxBuildsToShow })
    } else isMounted.current = true
  }, [characterKey, maxBuildsToShow])


  const { split, totBuildNumber } = useMemo(() => {
    if (!characterKey) // Make sure we have all slotKeys
      return Object.fromEntries(Artifact.getSlotKeys().map(slotKey => [slotKey, []]))
    const artifactDatabase = deepClone(ArtifactDatabase.getArtifactDatabase())
    //do not use artifacts that are locked.
    if (!useLockedArts)
      Object.entries(artifactDatabase).forEach(([key, val]) => {
        //if its equipped on the selected character, bypass the lock check
        if (val.location === characterKey) return
        //if its locked, or equipped, remove from consideration
        if (val.lock || val.location)
          delete artifactDatabase[key]
      })
    const split = Artifact.splitArtifactsBySlot(artifactDatabase);
    //filter the split slots on the mainstats selected.
    artifactsSlotsToSelectMainStats.forEach((slotKey, index) =>
      mainStatKeys[index] && (split[slotKey] = split[slotKey].filter((art) => art.mainStatKey === mainStatKeys[index])))
    const totBuildNumber = calculateTotalBuildNumber(split, setFilters)
    return { split, totBuildNumber }
  }, [characterKey, useLockedArts, mainStatKeys, setFilters])

  const generateBuilds = useCallback((turbo = false) => {
    if (typeof turbo !== "boolean") turbo = false
    setbuilds([])
    setgeneratingBuilds(true)
    setgenerationDuration(0)
    setgenerationProgress(0)
    setgenerationSkipped(0)
    //get the formula for this targer

    initialStats.mainStatAssumptionLevel = mainStatAssumptionLevel
    const artifactSetEffects = Artifact.getAllArtifactSetEffectsObj(initialStats)
    const splitArtifacts = deepClone(split)
    //add mainStatVal to each artifact
    Object.values(splitArtifacts).forEach(artArr => {
      artArr.forEach(art => {
        art.mainStatVal = Artifact.getMainStatValue(art.mainStatKey, art.numStars, Math.max(Math.min(mainStatAssumptionLevel, art.numStars * 4), art.level));
      })
    })
    //generate the key dependencies for the formula
    const minFilters = Object.fromEntries(Object.entries(statFilters).map(([statKey, { min }]) => [statKey, min]).filter(([, min]) => typeof min === "number"))
    const maxFilters = Object.fromEntries(Object.entries(statFilters).map(([statKey, { max }]) => [statKey, max]).filter(([, max]) => typeof max === "number"))
    //create an obj with app the artifact set effects to pass to buildworker.
    const data = {
      splitArtifacts, initialStats, artifactSetEffects,
      setFilters, minFilters, maxFilters, maxBuildsToShow, optimizationTarget, ascending, turbo
    }
    worker.current?.terminate()
    worker.current = new Worker();
    worker.current.onmessage = (e) => {
      if (typeof e.data.progress === "number") {
        const { progress, timing = 0, skipped = 0 } = e.data
        setgenerationProgress(progress)
        setgenerationDuration(timing)
        setgenerationSkipped(skipped)
        return
      }
      ReactGA.timing({
        category: "Build Generation",
        variable: "timing",
        value: e.data.timing,
        label: totBuildNumber
      })
      const builds = e.data.builds.map(obj =>
        Character.calculateBuildwithArtifact(initialStats, obj.artifacts))
      setbuilds(builds)
      setgeneratingBuilds(false)
      worker.current.terminate()
      worker.current = null
    }
    worker.current.postMessage(data)
  }, [split, totBuildNumber, mainStatAssumptionLevel, ascending, initialStats, maxBuildsToShow, optimizationTarget, setFilters, statFilters])

  //try to generate build when build numbers are low
  useEffect(() => {
    if (totBuildNumber <= autoBuildGenLimit) generateBuilds()
    else setbuilds([])
  }, [characterKey, split, totBuildNumber, buildSettings, generateBuilds])

  const dropdownitemsForStar = useCallback((star, index) => Artifact.getSetsByMaxStarEntries(star).map(([setKey, setobj]) => {
    if (setFilters.some(filter => filter.key === setKey)) return false;
    const setsNumArr = Object.keys(Artifact.getSetEffectsObj(setKey))
    const artsAccountedOther = setFilters.reduce((accu, cur, ind) => (cur.key && ind !== index) ? accu + cur.num : accu, 0)
    if (setsNumArr.every(num => parseInt(num) + artsAccountedOther > 5)) return false;
    return (<Dropdown.Item key={setKey} onClick={() => buildSettingsDispatch({ type: 'setFilter', index, key: setKey, num: parseInt(setsNumArr[0]) ?? 0 })} >
      {setobj.name}
    </Dropdown.Item>)
  }), [setFilters, buildSettingsDispatch])

  const characterDropDown = useMemo(() => <DropdownButton title={Character.getName(characterKey, "Select Character")} disabled={generatingBuilds}>
    <Dropdown.Item onClick={() => selectCharacter("")}>Unselect Character</Dropdown.Item>
    <Dropdown.Divider />
    <CharacterSelectionDropdownList onSelect={cKey => selectCharacter(cKey)} />
  </DropdownButton>, [characterKey, generatingBuilds, selectCharacter])

  const sortByText = useMemo(() => {
    if (Array.isArray(optimizationTarget)) {
      const formula = Formula.get(optimizationTarget)
      if (formula.field) {
        const variant = Character.getTalentFieldValue(formula.field, "variant", initialStats)
        const text = Character.getTalentFieldValue(formula.field, "text", initialStats)
        let [, , talentKey] = formula.keys
        if (talentKey === "normal" || talentKey === "charged" || talentKey === "plunging") talentKey = "auto"
        return <b>{Character.getTalentName(characterKey, talentKey)}: <span className={`text-${variant}`}>{text}</span></b>
      }
    } else return <b>Basic Stat: <span className={`text-${Stat.getStatVariant(optimizationTarget)}`}>{Stat.getStatNamePretty(optimizationTarget)}</span></b>
    return <Badge variant="danger">INVALID</Badge>
  }, [optimizationTarget, characterKey, initialStats])

  const characterName = Character.getName(characterKey, "Character Name")
  const artsAccounted = setFilters.reduce((accu, cur) => cur.key ? accu + cur.num : accu, 0)
  const artifactCondCount = useMemo(() => {
    let count = 0;
    crawlObject(initialStats?.conditionalValues, [], v => Array.isArray(v), () => count++)
    return count
  }, [initialStats?.conditionalValues])
  //rudimentary dispatcher, definitely not the same API as the real characterDispatch.
  const characterDispatch = useCallback(val => CharacterDatabase.update({ ...character, ...val }), [character])
  return <Container>
    <BuildModal {...{ build: modalBuild, showCharacterModal, characterKey, selectCharacter, setmodalBuild, setshowCharacterModal }} />
    <ArtConditionalModal {...{ showArtCondModal, setshowArtCondModal, initialStats, characterDispatch, artifactCondCount }} />
    <Row className="mt-2 mb-2">
      <Col>
        {/* Build Generator Editor */}
        <Card bg="darkcontent" text="lightfont">
          <Card.Header>Build Generator</Card.Header>
          <Card.Body>
            <Row >
              <Col xs={12} lg={6}>
                {/* character selection */}
                {characterKey ?
                  <CharacterCard header={characterDropDown} characterKey={characterKey} bg={"lightcontent"} footer={false} cardClassName="mb-2" onEdit={!generatingBuilds && (() => setshowCharacterModal(true))} /> :
                  <Card bg="lightcontent" text="lightfont" className="mb-2">
                    <Card.Header>
                      {characterDropDown}
                    </Card.Header>
                  </Card>}
                {/* Hit mode options */}
                {Character.hasTalentPage(characterKey) && <HitModeCard className="mb-2" character={character} />}
                {/* Final Stat Filter */}
                <StatFilterCard className="mb-2" statFilters={statFilters} statKeys={statsDisplayKeys?.basicKeys} setStatFilters={sFs => buildSettingsDispatch({ statFilters: sFs })} />
              </Col>
              <Col xs={12} lg={6}><Row>
                <Col className="mb-2" xs={12}>
                  <Card bg="lightcontent" text="lightfont"><Card.Body>
                    <Button className="w-100" onClick={() => setshowArtCondModal(true)} disabled={generatingBuilds}>
                      <span>Default Artifact Set Effects {Boolean(artifactCondCount) && <Badge variant="success">{artifactCondCount} Selected</Badge>}</span>
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
                          <Dropdown.Item onClick={() => buildSettingsDispatch({ type: 'setFilter', index, key: "" })}>Unselect Artifact</Dropdown.Item>
                          <Dropdown.ItemText>Max Rarity 🟊🟊🟊🟊🟊</Dropdown.ItemText>
                          {dropdownitemsForStar(5, index)}
                          <Dropdown.Divider />
                          <Dropdown.ItemText>Max Rarity 🟊🟊🟊🟊</Dropdown.ItemText>
                          {dropdownitemsForStar(4, index)}
                          <Dropdown.Divider />
                          <Dropdown.ItemText>Max Rarity 🟊🟊🟊</Dropdown.ItemText>
                          {dropdownitemsForStar(3, index)}
                        </DropdownButton>
                        {/* set number */}
                        <DropdownButton as={ButtonGroup} title={`${setNum}-set`}
                          disabled={generatingBuilds || !setKey || artsAccounted >= 5}
                        >
                          {Object.keys(Artifact.getSetEffectsObj(setKey)).map(num => {
                            let artsAccountedOther = setFilters.reduce((accu, cur) => (cur.key && cur.key !== setKey) ? accu + cur.num : accu, 0)
                            return (parseInt(num) + artsAccountedOther <= 5) &&
                              (<Dropdown.Item key={num} onClick={() => buildSettingsDispatch({ type: 'setFilter', index, key: setFilters[index].key, num: parseInt(num) })} >
                                {`${num}-set`}
                              </Dropdown.Item>)
                          })}
                        </DropdownButton>
                      </ButtonGroup>
                    </Card.Header>
                    {setKey ? <Card.Body><Row className="mb-n2">
                      {Object.keys(Artifact.getSetEffectsObj(setKey)).filter(setNkey => parseInt(setNkey) <= setNum).map(setNumKey =>
                        <SetEffectDisplay key={setKey + setNumKey} {...{ setKey, setNumKey, equippedBuild: initialStats, characterDispatch, editable: true }} />)}
                    </Row></Card.Body> : null}
                  </Card>
                </Col>)}
                <Col className="mb-2" xs={12}>
                  <Card bg="lightcontent" text="lightfont"><Card.Body>
                    <Button className="w-100" onClick={() => buildSettingsDispatch({ useLockedArts: !buildSettings.useLockedArts })} disabled={generatingBuilds}>
                      <span><FontAwesomeIcon icon={useLockedArts ? faCheckSquare : faSquare} /> Use Locked {"&"} Equipped Artifacts</span>
                    </Button>
                  </Card.Body></Card>
                </Col>
                {/* main stat selector */}
                <Col className="mb-2" xs={12}>
                  <Card bg="lightcontent" text="lightfont">
                    <Card.Header>
                      <Row>
                        <Col>Artifact Main Stat</Col>
                        <Col xs="auto"><AssumeFullLevelToggle mainStatAssumptionLevel={mainStatAssumptionLevel} setmainStatAssumptionLevel={v => buildSettingsDispatch({ mainStatAssumptionLevel: v })} /></Col>
                      </Row>
                    </Card.Header>
                    <Card.Body className="mb-n2">
                      {artifactsSlotsToSelectMainStats.map((slotKey, index) =>
                      (<div className="text-inline mb-1 d-flex justify-content-between" key={slotKey}>
                        <h6 className="d-inline mb-0">
                          {Artifact.getSlotNameWithIcon(slotKey)}
                        </h6>
                        <DropdownButton disabled={generatingBuilds} size="sm"
                          title={mainStatKeys[index] ? Stat.getStatNameWithPercent(mainStatKeys[index]) : "Select a mainstat"}
                          className="d-inline">
                          <Dropdown.Item onClick={() => buildSettingsDispatch({ type: "mainStatKey", index, mainStatKey: "" })} >No MainStat</Dropdown.Item>
                          {Artifact.getSlotMainStatKeys(slotKey).map(mainStatKey =>
                            <Dropdown.Item onClick={() => buildSettingsDispatch({ type: "mainStatKey", index, mainStatKey })} key={mainStatKey}>
                              {Stat.getStatNameWithPercent(mainStatKey)}
                            </Dropdown.Item>)}
                        </DropdownButton>
                      </div>))}
                    </Card.Body>
                  </Card>
                </Col>
              </Row></Col>
            </Row>
            <Row className="mb-2">
              <Col>{characterKey && <BuildAlert {...{ totBuildNumber, generatingBuilds, generationSkipped, generationProgress, generationDuration, characterName, maxBuildsToShow }} />}</Col>
            </Row>
            <Row className="d-flex justify-content-between">
              <Col xs="auto" >
                <ButtonGroup>
                  <Button
                    className="h-100"
                    disabled={!characterKey || generatingBuilds}
                    variant={(characterKey && totBuildNumber <= warningBuildNumber) ? "success" : "warning"}
                    onClick={generateBuilds}
                  ><span>Generate Builds</span></Button>
                  {totBuildNumber > warningBuildNumber && <OverlayTrigger
                    overlay={<Tooltip>Dramatically speeds up build time, but only generates one result. Does not work with Final Stat Filters.</Tooltip>}
                  >
                    <Button variant="success" disabled={Object.keys(statFilters).length} onClick={() => generateBuilds(true)}><strong>TURBO</strong></Button>
                  </OverlayTrigger>}
                  <Button
                    className="h-100"
                    disabled={!generatingBuilds}
                    variant="danger"
                    onClick={() => {
                      if (!worker.current) return
                      worker.current.terminate()
                      worker.current = null
                      setgeneratingBuilds(false)
                      setbuilds([])
                      setgenerationDuration(0)
                      setgenerationProgress(0)
                      setgenerationSkipped(0)
                    }}
                  ><span>Cancel</span></Button>
                </ButtonGroup>
              </Col>
              <Col xs="auto">
                {/* Dropdown to select sorting value */}
                <ButtonGroup>
                  <Dropdown as={ButtonGroup}>
                    <Dropdown.Toggle disabled={generatingBuilds} >
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
                            {fields.map((target, i) => {
                              if (typeof target === "string")
                                return <Dropdown.Item key={i} onClick={() => buildSettingsDispatch({ optimizationTarget: target })}>{Stat.getStatNamePretty(target)}</Dropdown.Item>
                              const formula = Formula.get(target)
                              const talentField = formula.field
                              if (!formula || !talentField) return null
                              return <Dropdown.Item key={i} onClick={() => buildSettingsDispatch({ optimizationTarget: target })}>
                                <span className={`text-${Character.getTalentFieldValue(talentField, "variant", initialStats)}`}>{Character.getTalentFieldValue(talentField, "text", initialStats)}</span>
                              </Dropdown.Item>
                            })}
                          </Col>
                        })}
                      </Row>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Button onClick={() => buildSettingsDispatch({ ascending: !buildSettings.ascending })} disabled={generatingBuilds} variant={ascending ? "danger" : "primary"}>
                    <FontAwesomeIcon icon={ascending ? faSortAmountDownAlt : faSortAmountUp} className="fa-fw" />
                    <span>{ascending ? "Ascending" : "Descending"}</span>
                  </Button>
                </ButtonGroup >
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Row className="mb-2">
      <Col>
        <Card bg="darkcontent" text="lightfont">
          <Card.Header>
            <Row>
              <Col>{characterKey ? <span>Showing <b>{builds.length}</b> Builds generated for {characterName}</span> : <span>Select a character to generate builds.</span>}</Col>
              <Col xs="auto">
                <DropdownButton title={<span>Max builds to show: <b>{maxBuildsToShow}</b></span>} size="sm">
                  {maxBuildsToShowList.map(v => <Dropdown.Item key={v} onClick={() => setmaxBuildsToShow(v)}>{v}</Dropdown.Item>)}
                </DropdownButton>
              </Col>
            </Row>
          </Card.Header>
          {/* Build List */}
          <ListGroup>
            {builds.map((build, index) =>
              (index < maxBuildsToShow) && <ArtifactDisplayItem build={build} characterKey={characterKey} index={index} key={index} statsDisplayKeys={statsDisplayKeys} onClick={() => setmodalBuild(build)} />
            )}
          </ListGroup>
        </Card>
      </Col>
    </Row>
  </Container >
}

function BuildModal({ build, showCharacterModal, characterKey, selectCharacter, setmodalBuild, setshowCharacterModal }) {
  const closeModal = useCallback(() => {
    setmodalBuild(null)
    setshowCharacterModal(false)
  }, [setmodalBuild, setshowCharacterModal])
  return <Modal show={Boolean(showCharacterModal || build)} onHide={closeModal} size="xl" contentClassName="bg-transparent">
    <React.Suspense fallback={<span>Loading...</span>}>
      <CharacterDisplayCard
        characterKey={characterKey}
        setCharacterKey={cKey => selectCharacter(cKey)}
        newBuild={build}
        onClose={closeModal}
        editable={showCharacterModal}
        footer={<Button variant="danger" onClick={closeModal}>Close</Button>} />
    </React.Suspense>
  </Modal>
}

function ArtConditionalModal({ showArtCondModal, setshowArtCondModal, initialStats, characterDispatch, artifactCondCount }) {
  const closeArtCondModal = useCallback(() => setshowArtCondModal(false), [setshowArtCondModal])
  const artSetKeyList = [5, 4, 3].map(s => Artifact.getSetsByMaxStarEntries(s).map(([key]) => key)).flat()
  return <Modal show={showArtCondModal} onHide={closeArtCondModal} size="xl" contentClassName="bg-transparent">
    <Card bg="darkcontent" text="lightfont" >
      <Card.Header>
        <Row>
          <Col>
            <h5>Default Artifact Set Effects  {Boolean(artifactCondCount) && <Badge variant="success">{artifactCondCount} Selected</Badge>}</h5>
          </Col>
          <Col xs="auto" >
            <Button onClick={() => {
              if (initialStats.conditionalValues.artifact) initialStats.conditionalValues.artifact = {}
              characterDispatch({ conditionalValues: initialStats.conditionalValues })
            }}><span><FontAwesomeIcon icon={faUndo} /> Reset All</span></Button>
          </Col>
          <Col xs="auto" >
            <Button variant="danger" onClick={closeArtCondModal}>
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
                <Card.Body><Row className="mb-n2">
                  {Boolean(setKey) && Object.keys(Artifact.getSetEffectsObj(setKey)).map(setNumKey =>
                    <SetEffectDisplay key={setKey + setNumKey} {...{ setKey, setNumKey, equippedBuild: initialStats, editable: true, characterDispatch, }} />)}
                </Row></Card.Body>
              </Card>
            </Col>
          })}
        </Row>
      </Card.Body>
      <Card.Footer>
        <Button variant="danger" onClick={closeArtCondModal}>
          <FontAwesomeIcon icon={faTimes} /> CLOSE</Button>
      </Card.Footer>
    </Card>
  </Modal>
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
    onChange: (s) => setFilter(statKey, s, max)
  }
  const maxInputProps = {
    ...inputProps,
    placeholder: "MAX",
    value: max,
    onChange: (s) => setFilter(statKey, min, s)
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

function HitModeCard({ character, className }) {
  const setHitmode = useCallback(({ hitMode }) => CharacterDatabase.update({ ...character, hitMode }), [character])
  const setReactionMode = useCallback(({ reactionMode }) => CharacterDatabase.update({ ...character, reactionMode }), [character])
  if (!character) return null
  return <Card bg="lightcontent" text="lightfont" className={className}>
    <Card.Header>Hit Mode Options</Card.Header>
    <Card.Body>
      <HitModeToggle hitMode={character.hitMode} characterDispatch={setHitmode} className="w-100" />
      <ReactionToggle character={character} characterDispatch={setReactionMode} className="w-100 mt-2" />
    </Card.Body>
  </Card >
}

function StatFilterCard({ statKeys = [], statFilters = {}, setStatFilters, className }) {
  const remainingKeys = statKeys.filter(key => !Object.keys(statFilters).some(k => k === key))
  const setFilter = (sKey, min, max) => setStatFilters({ ...statFilters, [sKey]: { min, max } })
  return <Card bg="lightcontent" text="lightfont" className={className}>
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
function ArtifactDisplayItem({ index, characterKey, build, statsDisplayKeys, onClick }) {
  return (<div>
    <ListGroup.Item
      variant={index % 2 ? "customdark" : "customdarker"} className="text-white" action
      onClick={onClick}
    >
      <h5>{Object.entries(build.setToSlots).sort(([key1, slotarr1], [key2, slotarr2]) => slotarr2.length - slotarr1.length).map(([key, slotarr]) =>
        <Badge key={key} variant="primary" className="mr-2">
          {slotarr.map(slotKey => Artifact.getSlotIcon(slotKey))} {Artifact.getSetName(key)}
        </Badge>
      )}</h5>
      <StatDisplayComponent {...{ character: CharacterDatabase.get(characterKey), newBuild: build, statsDisplayKeys, cardbg: (index % 2 ? "lightcontent" : "darkcontent") }} />
    </ListGroup.Item>
  </div>)
}

function BuildAlert({ totBuildNumber, generatingBuilds, generationSkipped, generationProgress, generationDuration, characterName, maxBuildsToShow }) {
  const totalBuildNumberString = totBuildNumber?.toLocaleString() ?? totBuildNumber
  const totalUnskipped = totBuildNumber - generationSkipped
  const generationProgressString = generationProgress?.toLocaleString() ?? generationProgress
  const generationSkippedString = generationSkipped?.toLocaleString() ?? generationSkipped
  const totalUnskippedString = totalUnskipped?.toLocaleString() ?? totalUnskipped
  const generationSkippedText = Boolean(generationSkipped) && <span>(<b>{generationSkippedString}</b> skipped)</span>
  if (generatingBuilds) {
    let progPercent = generationProgress * 100 / (totalUnskipped)
    return <Alert variant="success">
      <span>Generating and testing <b className="text-monospace">{generationProgressString}/{totalUnskippedString}</b> build configurations against the criteria for <b>{characterName}</b>. {generationSkippedText}</span><br />
      <h6>Time elapsed: <strong className="text-monospace">{timeStringMs(generationDuration)}</strong></h6>
      <ProgressBar now={progPercent} label={`${progPercent.toFixed(1)}%`} />
    </Alert>
  } else if (!generatingBuilds && generationProgress) {//done
    return <Alert variant="success">
      <span>Generated and tested <b className="text-monospace">{totalUnskippedString}</b> Build configurations against the criteria for <b>{characterName}</b>. {generationSkippedText}</span>
      <h6>Total duration: <strong className="text-monospace">{timeStringMs(generationDuration)}</strong></h6>
      <ProgressBar now={100} variant="success" label="100%" />
    </Alert>
  } else {
    return totBuildNumber === 0 ?
      <Alert variant="warning" className="mb-0"><span>Current configuration will not generate any builds for <b>{characterName}</b>. Please change your Artifact configurations, or add/unlock more Artifacts.</span></Alert>
      : (totBuildNumber > warningBuildNumber ?
        <Alert variant="warning" className="mb-0"><span>Current configuration will generate <b>{totalBuildNumberString}</b> builds for <b>{characterName}</b>. This might take quite a while to generate...</span></Alert> :
        <Alert variant="success" className="mb-0"><span>Current configuration {totBuildNumber <= maxBuildsToShow ? "generated" : "will generate"} <b>{totalBuildNumberString}</b> builds for <b>{characterName}</b>.</span></Alert>)
  }
}

const levels = {
  0: <span>No level assumption</span>,
  4: <span>Assume at least level 4</span>,
  8: <span>Assume at least level 8</span>,
  12: <span>Assume at least level 12</span>,
  16: <span>Assume at least level 16</span>,
  20: <span>Assume at least level 20</span>
}
function AssumeFullLevelToggle({ mainStatAssumptionLevel = 0, setmainStatAssumptionLevel }) {
  return <OverlayTrigger overlay={<Tooltip>Change Main Stat value to be at least a specific level. Does not change substats.</Tooltip>}  >
    <Dropdown>
      <Dropdown.Toggle variant={mainStatAssumptionLevel ? "orange" : "primary"}>{levels[mainStatAssumptionLevel]}</Dropdown.Toggle>
      <Dropdown.Menu>
        {Object.entries(levels).map(([key, text]) => <Dropdown.Item key={key} onClick={() => setmainStatAssumptionLevel(parseInt(key))}>{text}</Dropdown.Item>)}
      </Dropdown.Menu>
    </Dropdown>
  </OverlayTrigger>

}