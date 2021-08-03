import { faCheckSquare, faSortAmountDownAlt, faSortAmountUp, faSquare, faTimes, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Badge, Button, ButtonGroup, Card, Col, Container, Dropdown, DropdownButton, Image, InputGroup, ListGroup, Modal, OverlayTrigger, ProgressBar, Row, Tooltip } from 'react-bootstrap';
import ReactGA from 'react-ga';
// eslint-disable-next-line
import Worker from "worker-loader!./BuildWorker";
import Artifact from '../Artifact/Artifact';
import { ArtifactSheet } from '../Artifact/ArtifactSheet';
import SetEffectDisplay from '../Artifact/Component/SetEffectDisplay';
import Character from '../Character/Character';
import CharacterCard from '../Character/CharacterCard';
import { HitModeToggle, InfusionAuraDropdown, ReactionToggle } from '../Character/CharacterDisplay/DamageOptionsAndCalculation';
import StatDisplayComponent from '../Character/CharacterDisplay/StatDisplayComponent';
import CharacterSheet from '../Character/CharacterSheet';
import { CharacterSelectionDropdownList } from '../Components/CharacterSelection';
import CustomFormControl from '../Components/CustomFormControl';
import { Stars } from '../Components/StarDisplay';
import Formula from '../Formula';
import InfoComponent from '../Components/InfoComponent';
import Stat from '../Stat';
import { ArtifactsBySlot, Build, BuildSetting } from '../Types/Build';
import { ICharacter } from '../Types/character';
import { allSlotKeys, ArtifactSetKey, CharacterKey, SetNum, SlotKey } from '../Types/consts';
import { ICalculatedStats } from '../Types/stats';
import { IFieldDisplay } from '../Types/IFieldDisplay';
import { useForceUpdate, usePromise } from '../Util/ReactUtil';
import { timeStringMs } from '../Util/TimeUtil';
import { crawlObject, deepClone, loadFromLocalStorage, saveToLocalStorage } from '../Util/Util';
import WeaponSheet from '../Weapon/WeaponSheet';
import { calculateTotalBuildNumber } from './Build';
import SlotNameWithIcon, { artifactSlotIcon } from '../Artifact/Component/SlotNameWIthIcon';
import { database } from '../Database/Database';
import { StatKey } from '../Types/artifact';
import { getFormulaTargetsDisplayHeading } from '../Character/CharacterUtil';
const InfoDisplay = React.lazy(() => import('./InfoDisplay'));

//lazy load the character display
const CharacterDisplayCard = lazy(() => import('../Character/CharacterDisplayCard'))

const warningBuildNumber = 10000000
const maxBuildsToShowList = [50, 25, 10, 5]
const maxBuildsToShowDefault = 25
const autoBuildGenLimit = 100
const artifactsSlotsToSelectMainStats: SlotKey[] = ["sands", "goblet", "circlet"]
const initialBuildSettings = (): BuildSetting => ({
  setFilters: [{ key: "", num: 0 }, { key: "", num: 0 }, { key: "", num: 0 }],
  statFilters: {},
  mainStatKeys: ["", "", ""],
  optimizationTarget: "finalATK",
  mainStatAssumptionLevel: 0,
  useLockedArts: false,
  useEquippedArts: false,
  ascending: false,
})

function buildSettingsReducer(state: BuildSetting, action): BuildSetting {
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
  return { ...state, ...action }
}

export default function BuildDisplay({ location: { characterKey: propCharacterKey } }) {
  const [characterKey, setcharacterKey] = useState("" as CharacterKey | "")

  const [builds, setbuilds] = useState([] as any[])
  const [maxBuildsToShow, setmaxBuildsToShow] = useState(maxBuildsToShowDefault)

  const [modalBuild, setmodalBuild] = useState(null) // the newBuild that is being displayed in the character modal
  const [showArtCondModal, setshowArtCondModal] = useState(false)
  const [showCharacterModal, setshowCharacterModal] = useState(false)

  const [generatingBuilds, setgeneratingBuilds] = useState(false)
  const [generationProgress, setgenerationProgress] = useState(0)
  const [generationDuration, setgenerationDuration] = useState(0)//in ms
  const [generationSkipped, setgenerationSkipped] = useState(0)

  const [charDirty, setCharDirty] = useForceUpdate()
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])

  const [artsDirty, setArtsDirty] = useForceUpdate()

  const isMounted = useRef(false)

  const worker = useRef(null as Worker | null)

  type characterDataType = { character?: ICharacter, characterSheet?: CharacterSheet, weaponSheet?: WeaponSheet, initialStats?: ICalculatedStats, statsDisplayKeys?: { basicKeys: any, [key: string]: any } }
  const [{ character, characterSheet, weaponSheet, initialStats, statsDisplayKeys }, setCharacterData] = useState({} as characterDataType)
  const buildSettings = character?.buildSettings ?? initialBuildSettings()
  const { setFilters, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useLockedArts, useEquippedArts, ascending, } = buildSettings

  const buildSettingsDispatch = useCallback((action) => {
    if (!character) return
    character.buildSettings = buildSettingsReducer(buildSettings as any, action)
    database.updateChar(character)
  }, [character, buildSettings])

  useEffect(() => ReactGA.pageview('/build'), [])

  //load the character data as a whole
  useEffect(() => {
    (async () => {
      if (!characterKey || !artifactSheets) return
      const character = database._getChar(characterKey)
      if (!character) return
      const characterSheet = await CharacterSheet.get(characterKey)
      const weaponSheet = await WeaponSheet.get(character.weapon.key)
      if (!characterSheet || !weaponSheet) return
      const initialStats = Character.createInitialStats(character, characterSheet, weaponSheet)
      //NOTE: since initialStats are used, there are no inclusion of artifact formulas here.
      const statsDisplayKeys = Character.getDisplayStatKeys(initialStats, { characterSheet, weaponSheet, artifactSheets })
      setCharacterData({ character, characterSheet, weaponSheet, initialStats, statsDisplayKeys })
    })()
  }, [charDirty, characterKey, artifactSheets])

  //register changes in artifact database
  useEffect(() =>
    database.followAnyArt(setArtsDirty),
    [setArtsDirty])

  //register changes in character in db
  useEffect(() =>
    characterKey ? database.followChar(characterKey, setCharDirty) : undefined,
    [characterKey, setCharDirty])

  //terminate worker when component unmounts
  useEffect(() => () => worker.current?.terminate(), [])

  //select a new character Key
  const selectCharacter = useCallback((cKey = "") => {
    if (characterKey === cKey) return
    setcharacterKey(cKey)
    setbuilds([])
    setCharDirty()
    setCharacterData({})
  }, [setCharDirty, setcharacterKey, characterKey])

  //load saved stat from DB. will cause infinite loop if add 'selectCharacter' to dependency array
  useEffect(() => {//startup load from localStorage
    if (!("BuildsDisplay.state" in localStorage)) return
    const { characterKey = "", maxBuildsToShow = maxBuildsToShowDefault } = loadFromLocalStorage("BuildsDisplay.state") ?? {}
    if (characterKey && database._getChar(characterKey)) selectCharacter(characterKey)
    setmaxBuildsToShow(maxBuildsToShow)
  }, [])// eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => propCharacterKey && selectCharacter(propCharacterKey), [propCharacterKey, selectCharacter])//update when props update

  //save to BuildsDisplay.state on change
  useEffect(() => {
    if (isMounted.current) saveToLocalStorage("BuildsDisplay.state", { characterKey, maxBuildsToShow })
    else isMounted.current = true
  }, [characterKey, maxBuildsToShow])

  //validate optimizationTarget 
  useEffect(() => {
    if (!statsDisplayKeys) return
    if (!Array.isArray(optimizationTarget)) return
    for (const sectionKey in statsDisplayKeys) {
      const section = statsDisplayKeys[sectionKey]
      for (const keys of section)
        if (JSON.stringify(keys) === JSON.stringify(optimizationTarget)) return
    }
    buildSettingsDispatch({ optimizationTarget: initialBuildSettings().optimizationTarget })
  }, [optimizationTarget, statsDisplayKeys, buildSettingsDispatch])

  const { split, totBuildNumber } = useMemo(() => {
    if (!characterKey) // Make sure we have all slotKeys
      return { split: Object.fromEntries(allSlotKeys.map(slotKey => [slotKey, []])) as ArtifactsBySlot, totBuildNumber: 0 }
    const artifactDatabase = database._getArts().filter(art => {
      //if its equipped on the selected character, bypass the check
      if (art.location === characterKey) return true

      if (art.lock && !useLockedArts) return false
      if (art.location && !useEquippedArts) return false
      return true
    })
    const split = Artifact.splitArtifactsBySlot(artifactDatabase);
    //filter the split slots on the mainstats selected.
    artifactsSlotsToSelectMainStats.forEach((slotKey, index) =>
      mainStatKeys[index] && (split[slotKey] = split[slotKey]?.filter((art) => art.mainStatKey === mainStatKeys[index])))
    const totBuildNumber = calculateTotalBuildNumber(split, setFilters)
    return artsDirty && { split, totBuildNumber }
  }, [characterKey, useLockedArts, useEquippedArts, mainStatKeys, setFilters, artsDirty])

  const generateBuilds = useCallback((turbo = false) => {
    if (!initialStats || !artifactSheets) return
    if (typeof turbo !== "boolean") turbo = false
    setbuilds([])
    setgeneratingBuilds(true)
    setgenerationDuration(0)
    setgenerationProgress(0)
    setgenerationSkipped(0)
    //get the formula for this target

    initialStats.mainStatAssumptionLevel = mainStatAssumptionLevel
    const artifactSetEffects = Artifact.setEffectsObjs(artifactSheets, initialStats)
    const splitArtifacts = deepClone(split) as ArtifactsBySlot
    //add mainStatVal to each artifact
    Object.values(splitArtifacts).forEach(artArr => {
      artArr!.forEach(art => {
        art.mainStatVal = Artifact.mainStatValue(art.mainStatKey, art.numStars, Math.max(Math.min(mainStatAssumptionLevel, art.numStars * 4), art.level)) ?? 0;
      })
    })
    //generate the key dependencies for the formula
    const minFilters: Dict<StatKey, number> = Object.fromEntries(Object.entries(statFilters).map(([statKey, { min }]) => [statKey, min]).filter(([, min]) => typeof min === "number"))
    const maxFilters: Dict<StatKey, number> = Object.fromEntries(Object.entries(statFilters).map(([statKey, { max }]) => [statKey, max]).filter(([, max]) => typeof max === "number"))
    //create an obj with app the artifact set effects to pass to buildworker.
    const data = {
      splitArtifacts, initialStats, artifactSetEffects,
      setFilters, minFilters, maxFilters, maxBuildsToShow, optimizationTarget, ascending, turbo
    };
    worker.current?.terminate()
    worker.current = new Worker()
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
        label: totBuildNumber.toString()
      })
      const builds = (e.data.builds as Build[]).map(obj =>
        Character.calculateBuildwithArtifact(initialStats, obj.artifacts, artifactSheets))
      setbuilds(builds)
      setgeneratingBuilds(false)
      worker.current?.terminate()
      worker.current = null
    };
    worker.current.postMessage(data)
  }, [artifactSheets, split, totBuildNumber, mainStatAssumptionLevel, ascending, initialStats, maxBuildsToShow, optimizationTarget, setFilters, statFilters])

  //try to generate build when build numbers are low
  useEffect(() => {
    if (totBuildNumber && totBuildNumber <= autoBuildGenLimit) generateBuilds()
    else setbuilds([])
  }, [characterKey, split, totBuildNumber, buildSettings, generateBuilds])

  const dropdownitemsForStar = useCallback((star, index) => artifactSheets && ArtifactSheet.setsWithMaxRarity(artifactSheets, star).map(([setKey, setobj]) => {
    if (setFilters.some(filter => filter.key === setKey)) return false;
    const setsNumArr = Object.keys(artifactSheets?.[setKey]?.setEffects ?? {})
    const artsAccountedOther = setFilters.reduce((accu, cur, ind) => (cur.key && ind !== index) ? accu + cur.num : accu, 0)
    if (setsNumArr.every((num: any) => parseInt(num) + artsAccountedOther > 5)) return false;
    return (<Dropdown.Item key={setKey} onClick={() => buildSettingsDispatch({ type: 'setFilter', index, key: setKey, num: parseInt(setsNumArr[0] as any) ?? 0 })} >
      {setobj.name}
    </Dropdown.Item>)
  }), [setFilters, buildSettingsDispatch, artifactSheets])

  const characterName = characterSheet?.name ?? "Character Name"
  const characterDropDown = useMemo(() => <DropdownButton title={characterName} disabled={generatingBuilds}>
    <Dropdown.Item onClick={() => selectCharacter("")}>Unselect Character</Dropdown.Item>
    <Dropdown.Divider />
    <CharacterSelectionDropdownList onSelect={cKey => selectCharacter(cKey)} />
  </DropdownButton>, [characterName, generatingBuilds, selectCharacter])

  const formula = usePromise(Array.isArray(optimizationTarget) ? Formula.get(optimizationTarget) : undefined, [optimizationTarget])
  const sortByText = useMemo(() => {
    if (Array.isArray(optimizationTarget)) {
      if (!formula) return null
      let [type, , talentKey] = (formula as any).keys as string[]
      const field = (formula as any).field as IFieldDisplay
      const variant = Character.getTalentFieldValue(field, "variant", initialStats)
      const text = Character.getTalentFieldValue(field, "text", initialStats)
      if (type === "character") {
        if (talentKey === "normal" || talentKey === "charged" || talentKey === "plunging") talentKey = "auto"
        return <b>{characterSheet?.getTalentOfKey(talentKey, initialStats?.characterEle)?.name}: <span className={`text-${variant}`}>{text}</span></b>
      } else if (type === "weapon") {
        return <b>{weaponSheet?.name}: <span className={`text-${variant}`}>{text}</span></b>
      }
    } else return <b>Basic Stat: <span className={`text-${Stat.getStatVariant(optimizationTarget)}`}>{Stat.getStatNamePretty(optimizationTarget)}</span></b>
    // return <Badge variant="danger">INVALID</Badge>
  }, [optimizationTarget, formula, initialStats, characterSheet, weaponSheet])


  const artsAccounted = setFilters.reduce((accu, cur) => cur.key ? accu + cur.num : accu, 0)
  const artifactCondCount = useMemo(() => {
    let count = 0;
    crawlObject(initialStats?.conditionalValues?.artifact, [], v => Array.isArray(v), () => count++)
    return count
  }, [initialStats?.conditionalValues])
  //rudimentary dispatcher, definitely not the same API as the real characterDispatch.
  const characterDispatch = useCallback(val => database.updateChar({ ...character, ...val }), [character])

  const hasMinFilters = Object.entries(statFilters).some(([statKey, { min }]) => typeof min === "number")
  const hasMaxFilters = Object.entries(statFilters).some(([statKey, { max }]) => typeof max === "number")
  const disabledTurbo = ascending ? hasMinFilters : hasMaxFilters

  return <Container className="mt-2">
    <InfoComponent
      pageKey="buildPage"
      modalTitle="Character Management Page Guide"
      text={["For self-infused attacks, like Noelle's Sweeping Time, enable the skill in the talent page.",
        "You can compare the difference between equipped artifacts and generated builds.",
        "TURBO mode can process millions of builds in seconds.",
        "The more complex the formula, the longer the generation time.",]}
    ><InfoDisplay /></InfoComponent>
    <BuildModal {...{ build: modalBuild, showCharacterModal, characterKey, selectCharacter, setmodalBuild, setshowCharacterModal }} />
    {!!initialStats && <ArtConditionalModal {...{ showArtCondModal, setshowArtCondModal, initialStats, characterDispatch, artifactCondCount }} />}
    <Row className="mt-2 mb-2">
      <Col>
        {/* Build Generator Editor */}
        <Card bg="darkcontent" text={"lightfont" as any}>
          <Card.Header>Build Generator</Card.Header>
          <Card.Body>
            <Row >
              <Col xs={12} lg={6}>
                {/* character selection */}
                {characterKey ?
                  <CharacterCard header={characterDropDown} characterKey={characterKey} bg={"lightcontent"} cardClassName="mb-2" onEdit={!generatingBuilds ? () => setshowCharacterModal(true) : undefined} /> :
                  <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
                    <Card.Header>
                      {characterDropDown}
                    </Card.Header>
                  </Card>}
                {/* Hit mode options */}
                {characterSheet && character && initialStats && <HitModeCard build={initialStats} characterSheet={characterSheet} className="mb-2" character={character} />}
                {/* Final Stat Filter */}
                {Boolean(statsDisplayKeys) && <StatFilterCard className="mb-2" statFilters={statFilters} statKeys={statsDisplayKeys?.basicKeys as any} setStatFilters={sFs => buildSettingsDispatch({ statFilters: sFs })} />}
              </Col>
              <Col xs={12} lg={6}><Row>
                <Col className="mb-2" xs={12}>
                  <Card bg="lightcontent" text={"lightfont" as any}><Card.Body>
                    <Button className="w-100" onClick={() => setshowArtCondModal(true)} disabled={generatingBuilds}>
                      <span>Default Artifact Set Effects {Boolean(artifactCondCount) && <Badge variant="success">{artifactCondCount} Selected</Badge>}</span>
                    </Button>
                  </Card.Body></Card>
                </Col>
                {/* Artifact set picker */}
                {setFilters.map(({ key: setKey, num: setNum }, index) => <Col className="mb-2" key={index} xs={12}>
                  <Card className="h-100" bg="lightcontent" text={"lightfont" as any}>
                    <Card.Header>
                      <ButtonGroup>
                        {/* Artifact set */}
                        <DropdownButton as={ButtonGroup} title={artifactSheets?.[setKey]?.name ?? "Artifact Set Filter"} disabled={generatingBuilds}>
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
                          {!!initialStats && Object.keys(artifactSheets?.[setKey]?.setEffects ?? {}).map((num: any) => {
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
                      {!!initialStats && Object.keys(artifactSheets?.[setKey].setEffects ?? {}).map(setNKey => parseInt(setNKey) as SetNum).filter(setNkey => setNkey <= setNum).map(setNumKey =>
                        <SetEffectDisplay newBuild={undefined} key={setKey + setNumKey} {...{ setKey, setNumKey, equippedBuild: initialStats, characterDispatch, editable: true }} />)}
                    </Row></Card.Body> : null}
                  </Card>
                </Col>)}
                <Col className="mb-2" xs={12}>
                  <Card bg="lightcontent" text={"lightfont" as any}><Card.Body className="mb-n2">
                    <Button className="w-100 mb-2" onClick={() => buildSettingsDispatch({ useEquippedArts: !useEquippedArts })} disabled={generatingBuilds}>
                      <span><FontAwesomeIcon icon={useEquippedArts ? faCheckSquare : faSquare} /> Use Equipped Artifacts</span>
                    </Button>
                    <Button className="w-100 mb-2" onClick={() => buildSettingsDispatch({ useLockedArts: !useLockedArts })} disabled={generatingBuilds}>
                      <span><FontAwesomeIcon icon={useLockedArts ? faCheckSquare : faSquare} /> Use Locked Artifacts</span>
                    </Button>
                  </Card.Body></Card>
                </Col>
                {/* main stat selector */}
                <Col className="mb-2" xs={12}>
                  <Card bg="lightcontent" text={"lightfont" as any}>
                    <Card.Header>
                      <Row>
                        <Col>Artifact Main Stat</Col>
                        <Col xs="auto"><AssumeFullLevelToggle mainStatAssumptionLevel={mainStatAssumptionLevel} setmainStatAssumptionLevel={v => buildSettingsDispatch({ mainStatAssumptionLevel: v })} /></Col>
                      </Row>
                    </Card.Header>
                    <Card.Body className="mb-n2">
                      {artifactsSlotsToSelectMainStats.map((slotKey, index) =>
                      (<div className="text-inline mb-1 d-flex justify-content-between" key={slotKey}>
                        <h6 className="d-inline mb-0"><SlotNameWithIcon slotKey={slotKey} /></h6>
                        <DropdownButton disabled={generatingBuilds} size="sm"
                          title={mainStatKeys[index] ? Stat.getStatNameWithPercent(mainStatKeys[index]) : "Select a mainstat"}
                          className="d-inline">
                          <Dropdown.Item onClick={() => buildSettingsDispatch({ type: "mainStatKey", index, mainStatKey: "" })} >No MainStat</Dropdown.Item>
                          {Artifact.slotMainStats(slotKey).map(mainStatKey =>
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
              <Col>{!!characterKey && <BuildAlert {...{ totBuildNumber, generatingBuilds, generationSkipped, generationProgress, generationDuration, characterName, maxBuildsToShow }} />}</Col>
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
                    overlay={<Tooltip id="turbo-tooltip">
                      <div>Dramatically speeds up build time.</div>
                      <div>Yields only 1 build.</div>
                      {Boolean(disabledTurbo) && <div className="mt-2">Does not work with <b>{Boolean(ascending) ? 'min' : 'max'}imum</b> stat filter when sorting by <b>{Boolean(ascending) ? 'as' : 'des'}cending</b></div>}
                    </Tooltip>}
                  ><span >
                      <Button variant="success" disabled={disabledTurbo} className={`rounded-0 ${disabledTurbo ? "cursor-pointer" : ""}`} onClick={() => generateBuilds(true)}><strong>TURBO</strong></Button>
                    </span></OverlayTrigger>}
                  <Button
                    className="h-100"
                    disabled={!generatingBuilds}
                    variant="danger"
                    onClick={() => {
                      if (!worker.current) return;
                      worker.current.terminate();
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
                {<ButtonGroup>
                  <Dropdown as={ButtonGroup} drop="up">
                    <Dropdown.Toggle disabled={generatingBuilds} variant="light" >
                      <span>Optimization Target: {sortByText}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="right" style={{ minWidth: "40rem" }} >
                      <Row>
                        {!!statsDisplayKeys && Object.entries(statsDisplayKeys).map(([sectionKey, fields]: [string, any]) => {
                          const header = (characterSheet && weaponSheet && artifactSheets) ? getFormulaTargetsDisplayHeading(sectionKey, { characterSheet, weaponSheet, artifactSheets }, initialStats?.characterEle) : sectionKey
                          return <Col xs={12} md={6} key={sectionKey}>
                            <Dropdown.Header style={{ overflow: "hidden", textOverflow: "ellipsis" }}><b>{header}</b></Dropdown.Header>
                            {fields.map((target, i) => {
                              if (Array.isArray(target))
                                return <TargetSelectorDropdownItem key={i} {...{ target, buildSettingsDispatch, initialStats }} />
                              else if (typeof target === "string")
                                return <Dropdown.Item key={i} onClick={() => buildSettingsDispatch({ optimizationTarget: target })}>{Stat.getStatNamePretty(target)}</Dropdown.Item>
                              return null
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
                </ButtonGroup >}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <Row className="mb-2">
      <Col>
        <Card bg="darkcontent" text={"lightfont" as any}>
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
              index < maxBuildsToShow && characterSheet && weaponSheet && artifactSheets && <ArtifactDisplayItem sheets={{ characterSheet, weaponSheet, artifactSheets }} build={build} characterKey={characterKey as CharacterKey} index={index} key={index} statsDisplayKeys={statsDisplayKeys} onClick={() => setmodalBuild(build as any)} />
            )}
          </ListGroup>
        </Card>
      </Col>
    </Row>
  </Container >
}

function TargetSelectorDropdownItem({ target, buildSettingsDispatch, initialStats }) {
  const formula = usePromise(Formula.get(target), [target])
  if (!formula) return null
  const talentField = (formula as any).field as IFieldDisplay
  return <Dropdown.Item onClick={() => buildSettingsDispatch({ optimizationTarget: target })} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
    <span className={`text-${Character.getTalentFieldValue(talentField, "variant", initialStats)}`}>{Character.getTalentFieldValue(talentField, "text", initialStats)}</span>
  </Dropdown.Item>
}

function BuildModal({ build, showCharacterModal, characterKey, selectCharacter, setmodalBuild, setshowCharacterModal }) {
  const closeModal = useCallback(() => {
    setmodalBuild(null)
    setshowCharacterModal(false)
  }, [setmodalBuild, setshowCharacterModal])
  return <Modal show={Boolean(showCharacterModal || build)} onHide={closeModal} size="xl" contentClassName="bg-transparent">
    <React.Suspense fallback={<span>Loading...</span>}>
      <CharacterDisplayCard
        character={undefined}
        tabName={undefined}
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
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])
  if (!artifactSheets) return null
  const artSetKeyList = Object.entries(ArtifactSheet.setKeysByRarities(artifactSheets)).reverse().flatMap(([, sets]) => sets)
  return <Modal show={showArtCondModal} onHide={closeArtCondModal} size="xl" contentClassName="bg-transparent">
    <Card bg="darkcontent" text={"lightfont" as any}>
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
            const sheet = artifactSheets[setKey]
            let icon = Object.values(sheet.slotIcons)[0]
            let numStars = [...sheet.rarity][0]
            return <Col className="mb-2" key={setKey} xs={12} lg={6} xl={4}>
              <Card className="h-100" bg="lightcontent" text={"lightfont" as any}>
                <Card.Header >
                  <Row>
                    <Col xs="auto" className="ml-n3 my-n2">
                      <Image src={icon} className={`thumb-mid grad-${numStars}star m-1`} thumbnail />
                    </Col>
                    <Col >
                      <h6><b>{artifactSheets?.[setKey].name ?? ""}</b></h6>
                      <span><Stars stars={numStars} /></span>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body><Row className="mb-n2">
                  {Boolean(setKey) && Object.keys(sheet.setEffects).map(key => parseInt(key) as SetNum).map(setNumKey =>
                    <SetEffectDisplay newBuild={undefined} key={setKey + setNumKey} {...{ setKey, setNumKey, equippedBuild: initialStats, editable: true, characterDispatch, }} />)}
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

function StatFilterItem({ statKey, statKeys = [], min, max, close, setFilter }: {
  statKey?, statKeys, min, max, close, setFilter
}) {
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

function HitModeCard({ characterSheet, character, build, className }: { characterSheet: CharacterSheet, character: ICharacter, build: ICalculatedStats, className: string }) {
  const setHitmode = useCallback(({ hitMode }) => database.updateChar({ ...character, hitMode }), [character])
  const setReactionMode = useCallback(({ reactionMode }) => database.updateChar({ ...character, reactionMode }), [character])
  const setInfusionAura = useCallback(({ infusionAura }) => database.updateChar({ ...character, infusionAura }), [character])
  if (!character) return null
  return <Card bg="lightcontent" text={"lightfont" as any} className={className}>
    <Card.Header>
      <Row>
        <Col>Hit Mode Options</Col>
        <Col xs="auto"><InfusionAuraDropdown characterSheet={characterSheet} character={character} characterDispatch={setInfusionAura} /></Col>
      </Row>
    </Card.Header>
    <Card.Body className="mb-n2">
      <HitModeToggle hitMode={character.hitMode} characterDispatch={setHitmode} className="w-100 mb-2" />
      <ReactionToggle build={build} character={character} characterDispatch={setReactionMode} className="w-100 mb-2" />
    </Card.Body>
  </Card >
}

function StatFilterCard({ statKeys = [], statFilters = {}, setStatFilters, className }) {
  const remainingKeys = statKeys.filter(key => !(Object.keys(statFilters) as any).some(k => k === key))
  const setFilter = (sKey, min, max) => setStatFilters({ ...statFilters, [sKey]: { min, max } })
  return <Card bg="lightcontent" text={"lightfont" as any} className={className}>
    <Card.Header>Final Stat Filter</Card.Header>
    <Card.Body>
      <Row className="mb-n2">
        {(Object.entries(statFilters) as [string, { min, max }][]).map(([statKey, { min, max }]) => {
          return <Col xs={12} key={statKey} ><StatFilterItem statKey={statKey} statKeys={remainingKeys} setFilter={setFilter} min={min} max={max} close={() => {
            delete statFilters[statKey]
            setStatFilters({ ...statFilters })
          }} /></Col>
        })}
        <Col xs={12}>
          <StatFilterItem min={undefined} max={undefined} close={undefined} statKeys={remainingKeys} setFilter={setFilter} />
        </Col>
      </Row>
    </Card.Body>
  </Card>
}

type ArtifactDisplayItemProps = {
  sheets: {
    characterSheet: CharacterSheet
    weaponSheet: WeaponSheet,
    artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>
  },
  index: number,
  characterKey: CharacterKey,
  build: ICalculatedStats,
  statsDisplayKeys: any,
  onClick: () => void
}
//for displaying each artifact build
function ArtifactDisplayItem({ sheets, sheets: { artifactSheets }, index, characterKey, build, statsDisplayKeys, onClick }: ArtifactDisplayItemProps) {
  const character = database._getChar(characterKey)
  if (!character) return null
  const { equippedArtifacts } = character
  const currentlyEquipped = allSlotKeys.every(slotKey => equippedArtifacts[slotKey] === build.equippedArtifacts?.[slotKey])
  return (<div>
    <ListGroup.Item
      variant={index % 2 ? "customdark" : "customdarker"} className="text-white" action
      onClick={onClick}
    >
      <h5 className="mb-2"><Row>
        <Col xs="auto">
          <Badge variant="info"><strong>{index + 1}{currentlyEquipped ? " (Equipped)" : ""}</strong></Badge>
        </Col>
        <Col xs="auto">{(Object.entries(build.setToSlots) as [ArtifactSetKey, SlotKey[]][]).sort(([key1, slotarr1], [key2, slotarr2]) => slotarr2.length - slotarr1.length).map(([key, slotarr]) =>
          <Badge key={key} variant={currentlyEquipped ? "success" : "primary"} className="mr-2">
            {slotarr.map(slotKey => artifactSlotIcon(slotKey))} {artifactSheets?.[key].name ?? ""}
          </Badge>
        )}</Col>
      </Row></h5>
      <StatDisplayComponent editable={false} {...{ sheets, character, newBuild: build, statsDisplayKeys, cardbg: (index % 2 ? "lightcontent" : "darkcontent") }} />
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
  return <OverlayTrigger overlay={<Tooltip id="assume-level-tooltip">Change Main Stat value to be at least a specific level. Does not change substats.</Tooltip>}  >
    <Dropdown>
      <Dropdown.Toggle variant={mainStatAssumptionLevel ? "orange" : "primary"}>{levels[mainStatAssumptionLevel]}</Dropdown.Toggle>
      <Dropdown.Menu>
        {Object.entries(levels).map(([key, text]) => <Dropdown.Item key={key} onClick={() => setmainStatAssumptionLevel(parseInt(key))}>{text}</Dropdown.Item>)}
      </Dropdown.Menu>
    </Dropdown>
  </OverlayTrigger>
}
