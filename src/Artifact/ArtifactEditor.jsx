import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Alert, Badge, Button, ButtonGroup, Card, Col, Dropdown, DropdownButton, FormControl, InputGroup, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import CustomFormControl from '../Components/CustomFormControl';
import { Stars } from '../Components/StarDisplay';
import ArtifactDatabase from '../Database/ArtifactDatabase';
import Stat from '../Stat';
import { clamp, deepClone, getArrLastElement, getRandomElementFromArray, getRandomIntInclusive } from '../Util/Util';
import Artifact from './Artifact';
import ArtifactCard from './ArtifactCard';
import PercentBadge from './PercentBadge';
import UploadDisplay from './UploadDisplay';

export const initialArtifact = () => ({
  id: null,
  setKey: "",
  numStars: 0,
  level: 0,
  slotKey: "",//one of flower, plume, sands, globlet, circlet
  mainStatKey: "",
  substats: [...Array(4).keys()].map(() => ({ key: "", value: 0 })),
  location: "",
})

// assume only one prop is changed at a time.
export function artifactReducer(state, action) {
  switch (action.type) {
    case "reset":
      return initialArtifact()
    case "substat": {
      const { index, key, value } = action
      if (state.mainStatKey === key) return state
      if (state.substats.some((substat, i) => i !== index && substat.key === key)) return state
      if (index >= 4) return state
      const substats = state.substats
      substats[index].key = key
      substats[index].value = value
      return { ...state, substats }
    }
    case "overwrite":
      return action.artifact
    default:
      break;
  }

  const newState = { ...state, ...action }
  if ("setKey" in action) {
    if (!Artifact.getSetKeys().includes(newState.setKey)) return state
    action.numStars = newState.numStars//trigger numStar
    action.slotKey = newState.slotKey//trigger slotKey
  }
  if ("numStars" in action) {
    const rarity = Artifact.getRarityArr(newState.setKey)
    if (!rarity.includes(newState.numStars))
      newState.numStars = getArrLastElement(rarity)
    action.level = newState.level//trigger level 
  }
  if ("level" in action) newState.level = clamp(newState.level, 0, newState.numStars * 4)
  if ("slotKey" in action) {
    const pieces = Object.keys(Artifact.getPieces(newState.setKey))
    if (!pieces.includes(newState.slotKey))
      newState.slotKey = pieces[0]
    action.mainStatKey = newState.mainStatKey//trigger mainStatKey
  }

  if ("mainStatKey" in action) {
    const mainstats = Artifact.getSlotMainStatKeys(newState.slotKey);
    //set mainStatKey if not set or invalid
    if (!newState.mainStatKey || !mainstats.includes(newState.mainStatKey)) {
      //find a mainstat that isnt taken,
      let selectedMainStatKey = ""
      if (mainstats.length === 1) selectedMainStatKey = mainstats[0]//flower or plume
      else {
        for (const mainStatKey of mainstats)
          if (!newState.substats.some(substat => substat.key === mainStatKey)) {
            selectedMainStatKey = mainStatKey
            break
          }
        //if could not resolve a substat, set mainstatkey to pass down redux
        if (!selectedMainStatKey) selectedMainStatKey = mainstats[0]
      }
      newState.mainStatKey = selectedMainStatKey
    }

    newState.substats.forEach((substat, index) =>
      substat.key === newState.mainStatKey && (newState.substats[index] = { key: "", value: 0 }))
  }

  return newState
}
const getRemainingSubstats = (mainStatKey, substats) =>
  Artifact.getSubStatKeys().filter(key => {
    //if mainstat has key, not valid
    if (mainStatKey === key) return false;
    //if any one of the substat has, not valid.
    return !substats.some(substat => substat?.key === key)
  });

//TODO: unit test
function checkDuplicate(editorArt) {
  const { id, setKey = "", numStars = 0, level = 0, slotKey = "", mainStatKey = "", substats = initialArtifact().substats } = editorArt
  let dupId = null
  let isDup = false
  if (id || !setKey || !slotKey || !numStars || !mainStatKey) return { dupId, dup: isDup }
  //check for a "upgrade" or duplicate
  const artifacts = Object.values(ArtifactDatabase.getArtifactDatabase()).filter(art => {
    if (setKey !== art.setKey) return false;
    if (numStars !== art.numStars) return false;
    if (slotKey !== art.slotKey) return false
    if (mainStatKey !== art.mainStatKey) return false
    if (art.level > level) return false;
    for (const artSubstat of art.substats) {
      if (!artSubstat.key) continue
      const substat = substats.find(substat =>
        substat.key === artSubstat.key &&
        (substat.value > artSubstat.value || Artifact.subStatCloseEnough(substat.key, substat.value, artSubstat.value)))
      if (!substat) return false
    }
    return true
  })
  if (!artifacts.length) return { dupId, dup: isDup }
  dupId = artifacts[0]?.id
  //check for a dup
  const dupArtifacts = artifacts.filter(art => {
    if (art.level !== level) return false;
    for (const artSubstat of art.substats) {
      if (!artSubstat.key) continue
      const substat = substats.find(substat =>
        substat.key === artSubstat.key && Artifact.subStatCloseEnough(substat.key, substat.value, artSubstat.value))
      if (!substat) return false
    }
    return true
  })
  if (dupArtifacts.length > 0) {
    dupId = dupArtifacts[0].id
    isDup = true
  }
  return { dupId, isDup }
}

let uploadDisplayReset
export default function ArtifactEditor({ artifactIdToEdit, cancelEdit }) {
  const [artifact, artifactDispatch] = useReducer(artifactReducer, initialArtifact())
  const artifactInEditor = useMemo(() => !ArtifactDatabase.isInvalid(artifact), [artifact])
  useEffect(() => {
    if (artifactIdToEdit && artifactIdToEdit !== artifact.id)
      artifactDispatch({ type: "overwrite", artifact: deepClone(ArtifactDatabase.get(artifactIdToEdit)) })
  }, [artifactIdToEdit, artifact.id])

  const saveArtifact = (id) => {
    const artToSave = deepClone(artifact)
    if (typeof id === "string") {
      const art = ArtifactDatabase.get(id)
      if (art) {
        artToSave.id = art.id
        artToSave.location = art.location
      }
    }
    if (!artToSave.maximumEfficiency) //calculate rolls & efficiency for caching
      Artifact.substatsValidation(artToSave)
    ArtifactDatabase.update(artToSave)
    cancelEdit?.();
    uploadDisplayReset?.()
    artifactDispatch({ type: "reset" })
  }
  const clearArtifact = () => {
    if (artifactInEditor && !window.confirm("There is an artifact in editor. Are you sure you want to clear the editor?")) return
    uploadDisplayReset?.()
    cancelEdit?.();
    artifactDispatch({ type: "reset" })
  }
  const setSubstat = useCallback(
    (index, key = "", value = 0) => artifactDispatch({ type: "substat", index, key, value }), [])

  const getUpdloadDisplayReset = useCallback(
    reset => uploadDisplayReset = reset, [])
  const randomizeArtifact = () => {
    const state = initialArtifact();
    //randomly choose artifact set
    state.setKey = getRandomElementFromArray(Artifact.getSetKeys());
    //choose star
    state.numStars = getRandomElementFromArray(Artifact.getRarityArr(state.setKey));
    //choose piece
    state.slotKey = getRandomElementFromArray(Object.keys(Artifact.getPieces(state.setKey)));
    //choose mainstat
    state.mainStatKey = getRandomElementFromArray(Artifact.getSlotMainStatKeys(state.slotKey));

    //choose initial substats from star
    let numOfInitialSubStats = getRandomIntInclusive(Artifact.getBaseSubRollNumLow(state.numStars), Artifact.getBaseSubRollNumHigh(state.numStars));

    //choose level
    state.level = getRandomIntInclusive(0, state.numStars * 4)
    let numUpgradesOrUnlocks = Math.floor(state.level / 4);
    const totRolls = numOfInitialSubStats + numUpgradesOrUnlocks
    if (totRolls >= 4) {
      numOfInitialSubStats = 4;
      numUpgradesOrUnlocks = totRolls - 4;
    } else {
      numOfInitialSubStats = totRolls;
      numUpgradesOrUnlocks = 0;
    }
    const RollStat = (subStatKey) =>
      getRandomElementFromArray(Artifact.getSubstatRollData(subStatKey, state.numStars))

    let remainingSubstats = getRemainingSubstats(state.mainStatKey, state.substats)
    //set initial substat & value
    for (let i = 0; i < numOfInitialSubStats; i++) {
      let substat = state.substats[i]
      substat.key = getRandomElementFromArray(remainingSubstats)
      remainingSubstats = remainingSubstats.filter(key => key !== substat.key)
      substat.value = RollStat(substat.key)
    }

    //numUpgradesOrUnlocks should only have upgrades right now. that means all 4 substats have value.
    for (let i = 0; i < numUpgradesOrUnlocks; i++) {
      let substat = getRandomElementFromArray(state.substats)
      substat.value += RollStat(substat.key)
      //make sure there is no rounding numbers
      if (!Number.isInteger(substat.value)) substat.value = parseFloat(substat.value.toFixed(1))

    }
    cancelEdit?.();
    artifactDispatch({ type: "overwrite", artifact: state })
  }

  const { dupId, isDup } = useMemo(() => checkDuplicate(artifact), [artifact])

  const errMsgs = Artifact.substatsValidation(artifact)
  const { id, setKey = "", numStars = 0, level = 0, slotKey = "", mainStatKey = "", substats = initialArtifact().substat, currentEfficiency, maximumEfficiency } = artifact
  //check if all the substats are filled
  const invalidSubstat = substats.find(substat => substat.key && !substat.value)
  invalidSubstat && errMsgs.push(<span>Invalid substat value: <b>{Stat.getStatName(invalidSubstat.key)}</b>.</span>)
  return <Card bg="darkcontent" text="lightfont">
    <Card.Header>Artifact Editor</Card.Header>
    <Card.Body><Row className="mb-n2">
      {/* set & rarity */}
      <Col xs={12} lg={6} className="mb-2">
        <InputGroup className="w-100 d-flex">
          {/* Artifact Set */}
          <Dropdown as={InputGroup.Prepend} className="flex-grow-1">
            <Dropdown.Toggle className="w-100" variant={setKey ? "success" : "primary"}>
              {Artifact.getSetName(setKey, "Artifact Set")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {[5, 4, 3].map((star, i) =>
                <React.Fragment key={star}>
                  {i > 0 && <Dropdown.Divider />}
                  <Dropdown.ItemText>Max Rarity <Stars stars={star} /></Dropdown.ItemText>
                  {Artifact.getSetsByMaxStarEntries(star).map(([key, setobj]) =>
                    <Dropdown.Item key={key} onClick={() => artifactDispatch({ setKey: key })}>
                      {setobj.name}
                    </Dropdown.Item >)}
                </React.Fragment>)}
            </Dropdown.Menu>
          </Dropdown>
          {/* rarity dropdown */}
          <DropdownButton as={InputGroup.Append} title={numStars > 0 ? <Stars stars={numStars} /> : "Rarity"} disabled={!setKey} variant={numStars ? "success" : "primary"}>
            {Artifact.getStars().map((star, index) => <Dropdown.Item key={index} disabled={!Artifact.getRarityArr(setKey).includes(star)} onClick={() => artifactDispatch({ numStars: star })}>
              {<Stars stars={star} />}
            </Dropdown.Item>)}
          </DropdownButton>
        </InputGroup>
      </Col>
      {/* level */}
      <Col xs={12} lg={6} className="mb-2">
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>Level</InputGroup.Text>
          </InputGroup.Prepend>
          <CustomFormControl value={level} disabled={!setKey} placeholder={`0~${numStars * 4}`} onChange={l => artifactDispatch({ level: l })} />
          <InputGroup.Append>
            <Button onClick={() => artifactDispatch({ level: 0 })} disabled={!setKey || level === 0}>0</Button>
            <Button onClick={() => artifactDispatch({ level: level - 1 })} disabled={!setKey || level === 0}>-</Button>
            <Button onClick={() => artifactDispatch({ level: level + 1 })} disabled={!setKey || level === (numStars * 4)}>+</Button>
            <Button onClick={() => artifactDispatch({ level: numStars * 4 })} disabled={!setKey || level === (numStars * 4)}>{numStars * 4}</Button>
          </InputGroup.Append>
        </InputGroup>
      </Col>
      {/* slot */}
      <Col xs={12} lg={6} className="mb-2">
        <InputGroup>
          <DropdownButton
            title={Artifact.getSlotNameWithIcon(slotKey, "Slot")}
            disabled={!setKey}
            variant={slotKey ? "success" : "primary"}
            as={InputGroup.Prepend}
          >
            {Object.keys(Artifact.getPieces(setKey)).map(sKey =>
              <Dropdown.Item key={sKey} onClick={() => artifactDispatch({ slotKey: sKey })} >
                {Artifact.getSlotNameWithIcon(sKey, "Slot")}
              </Dropdown.Item>)}
          </DropdownButton>
          <FormControl
            value={Artifact.getPieceName(setKey, slotKey, "Unknown Piece Name")}
            disabled
            readOnly
          />
        </InputGroup>
      </Col>
      {/* main stat */}
      <Col xs={12} lg={6} className="mb-2">
        <InputGroup>
          <DropdownButton
            title={<b>{Stat.getStatNameWithPercent(mainStatKey, "Main Stat")}</b>}
            disabled={!setKey || !slotKey}
            variant={mainStatKey ? "success" : "primary"}
            as={InputGroup.Prepend}
          >
            <Dropdown.ItemText>Select a Main Artifact Stat </Dropdown.ItemText>
            {Artifact.getSlotMainStatKeys(slotKey).map(mainStatK =>
              <Dropdown.Item key={mainStatK} onClick={() => artifactDispatch({ mainStatKey: mainStatK })} >
                {Stat.getStatNameWithPercent(mainStatK)}
              </Dropdown.Item>)}
          </DropdownButton>
          <FormControl
            value={mainStatKey ? `${Artifact.getMainStatValue(mainStatKey, numStars, level)}${Stat.getStatUnit(mainStatKey)}` : "Main Stat"}
            disabled
            readOnly
          />
        </InputGroup>
      </Col>
      {/* substat selections */}
      {substats.map((substat, index) => {
        const remainingSubstats = getRemainingSubstats(mainStatKey, substats);
        return <Col key={"substat" + index} className="mb-2" xs={12} lg={6}>
          <SubStatInput {...{ index, substat, numStars, remainingSubstats, setSubstat }} />
        </Col>
      })}
      {/* Current Substat Efficiency */}
      <Col xs={12} lg={6} className="mb-2">
        <Card bg="lightcontent" text="lightfont">
          <Card.Body className="py-1 px-2">
            <Row>
              <Col className="text-center"><span >Current Substat Efficiency </span></Col>
              <Col xs="auto">
                <PercentBadge valid={!errMsgs.length} percent={currentEfficiency}>
                  {currentEfficiency.toFixed(2) + "%"}
                </PercentBadge>
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Popover >
                    <Popover.Title as="h5">Current Substat Efficiency</Popover.Title>
                    <Popover.Content>
                      <span>Every 4 artifact upgrades, you get a substat roll. <strong>Substat Efficiency</strong> calculates how high the substat rolled as a percentage.</span>
                    </Popover.Content>
                  </Popover>}
                >
                  <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
                </OverlayTrigger>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
      {/* Maximum Substat Efficiency */}
      <Col xs={12} lg={6} className="mb-2">
        <Card bg="lightcontent" text="lightfont">
          <Card.Body className="py-1 px-2">
            <Row>
              <Col className="text-center"><span>Maximum Substat Efficiency </span></Col>
              <Col xs="auto">
                <PercentBadge valid={!errMsgs.length} percent={maximumEfficiency}>
                  {maximumEfficiency.toFixed(2) + "%"}
                </PercentBadge>
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Popover >
                    <Popover.Title as="h5">Maximum Substat Efficiency</Popover.Title>
                    <Popover.Content>
                      <span>The <strong>Maximum Substat Efficiency</strong> of an artifact calculates the efficiency if the remaining upgrades rolled their maximum values.</span>
                    </Popover.Content>
                  </Popover>}
                >
                  <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
                </OverlayTrigger>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
      {/* Image OCR */}
      <Col xs={12} className="mb-2">
        {/* TODO: artifactDispatch not overwrite */}
        <UploadDisplay setState={state => artifactDispatch({ type: "overwrite", artifact: state })} setReset={getUpdloadDisplayReset} artifactInEditor={artifactInEditor} />
      </Col>
      {/* Duplicate/Updated/Edit UI */}
      {(dupId || id) && <Col xs={12} className="mb-2">
        <Row className="d-flex justify-content-around mb-n2">
          <Col lg={4} md={6} className="mb-2">
            <h6 className="text-center">Artifact Editor Preview</h6>
            <div><ArtifactCard artifactObj={artifact} /></div>
          </Col>
          <Col lg={4} md={6} className="mb-2">
            <h6 className="text-center">{dupId ? `Detected ${isDup ? "Duplicate" : "Upgraded"} Artifact` : `Before Edit`}</h6>
            <div><ArtifactCard artifactId={dupId || id} /></div>
          </Col>
        </Row>
      </Col>}
      {/* Error alert */}
      {Boolean(errMsgs.length) && <Col xs={12} className="mb-2">
        <Alert variant="danger" className="py-2 px-3 mb-0 ">{errMsgs.map((e, i) => <div key={i}>{e}</div>)}</Alert>
      </Col>}
    </Row></Card.Body>
    <Card.Footer>
      <Button className="mr-2" onClick={saveArtifact} disabled={ArtifactDatabase.isInvalid(artifact) || errMsgs.length} variant={dupId ? "warning" : "primary"}>
        {id ? "Save Artifact" : "Add Artifact"}
      </Button>
      <Button className="mr-2" onClick={clearArtifact} variant="success">Clear</Button>
      {process.env.NODE_ENV === "development" && <Button variant="info" onClick={randomizeArtifact}>Randomize</Button>}
      {Boolean(dupId) && <Button className="float-right" onClick={() => saveArtifact(dupId)} disabled={ArtifactDatabase.isInvalid(artifact) || errMsgs.length} variant="success">Update Artifact</Button>}
    </Card.Footer>
  </Card>
}


function SubStatInput({ index, substat: { key, value, rolls, efficiency }, numStars, remainingSubstats = [], setSubstat }) {
  const isPercentStat = Stat.getStatUnit(key) === "%"
  let error = ""
  if (!numStars && key && value) error = `Artifact Rarity not set.`;
  let rollData = Artifact.getSubstatRollData(key, numStars)
  let rollNum = rolls?.length || 0
  if (!error && !rollNum && key && value)
    error = `Substat cannot be rolled 0 times.`
  if (!error && numStars) {
    //account for the rolls it will to fill all 4 substates, +1 for its base roll
    let totalAllowableRolls = Artifact.getNumUpgradesOrUnlocks(numStars) - (4 - Artifact.getBaseSubRollNumHigh(numStars)) + 1;
    if (rollNum > totalAllowableRolls) error = `Substat cannot be rolled more than ${totalAllowableRolls} times.`;
  }
  let rollLabel = null
  if (!error) {
    const rollBadge = <Badge variant={rollNum === 0 ? "secondary" : `${rollNum}roll`} className="text-darkcontent">
      {rollNum ? rollNum : "No"} Roll{(rollNum > 1 || rollNum === 0) && "s"}
    </Badge>
    const rollArr = rolls?.map((val, i) => {
      const ind = rollData.indexOf(val)
      const displayNum = 6 - (rollData.length - 1 - ind)
      return <span key={i} className={`mr-2 text-${displayNum}roll`}>{val}</span>
    })

    const efficiencyBadge = <PercentBadge
      valid={!error || !key}
      percent={efficiency}>
      {key ? (!error ? `${(efficiency ? efficiency : 0).toFixed(2)}%` : "ERR") : "No Stat"}
    </PercentBadge>
    rollLabel = <Row>
      <Col>{rollBadge} {rollArr}</Col>
      <Col xs="auto">Efficiency: {efficiencyBadge}</Col>
    </Row>
  }
  return <Card bg="lightcontent" text="lightfont">
    <InputGroup>
      <DropdownButton
        title={Stat.getStatNameWithPercent(key, `Substat ${index + 1}`)}
        disabled={remainingSubstats.length === 0}
        variant={key ? "success" : "primary"}
        as={InputGroup.Prepend}
      >
        {Boolean(key) && <Dropdown.Item key={key} onClick={() => setSubstat?.(index, "")} >No Substat</Dropdown.Item>}
        {remainingSubstats.map((key) =>
          <Dropdown.Item key={key} onClick={() => setSubstat?.(index, key)} >
            {Stat.getStatNameWithPercent(key)}
          </Dropdown.Item>
        )}
      </DropdownButton>
      <CustomFormControl
        float={isPercentStat}
        placeholder="Select a Substat."
        value={value || ""}
        onChange={(val) => setSubstat?.(index, key, val)}
        disabled={!key}
        allowEmpty
      />
      {Boolean(rollData.length) && <ButtonGroup size="sm" as={InputGroup.Append}>
        {rollData.map((v, i, arr) =>
          <Button key={i} variant={`${6 - (arr.length - 1 - i)}roll`} className="py-0 text-darkcontent" onClick={() => setSubstat?.(index, key, isPercentStat ? parseFloat((value + v).toFixed(1)) : (value + v))}>{v}</Button>)}
      </ButtonGroup>}
    </InputGroup>
    <div className="p-1">{!error ? rollLabel : <span><Badge variant="danger">ERR</Badge> {error}</span>}</div>
  </Card>
}